const Utils = require('../lib/utils.js');
let config = require("../config/config.js").getConfig();
let md5 = require('md5');

let port = config.eventstream.port != '' ? ':' + config.eventstream.port : '';
let path = config.eventstream.path != '' ? config.eventstream.path + '/' : '';

let db = null;
const numberOfObjectsPerFragment = 5;

module.exports.getDiscoveryMetadata = async function(req, res) {
    try {
        if(!db) db = await Utils.initDb();

        res.set({
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/ld+json'
        });

        let md = {
            "@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/DCAT-AP-VL/standaard/2019-06-13/context/DCAT-AP-VL.jsonld", {
                "dcterms": "http://purl.org/dc/terms/"
            }],
            "@id": config.eventstream.protocol + '://' + config.eventstream.hostname + port + '/' + path + 'id/datasetcatalogus/coghent',
            "@type": "DatasetCatalogus",
            "DatasetCatalogus.titel": "Catalogus CoGhent",
            "DatasetCatalogus.beschrijving": "Catalogus van datasets voor de Collectie van de Gentenaar.",
            "heeftDataset": []
        };
        const institutions = await db.models.Member.findAll(  {
            attributes: ['institution'],
            group: "institution"
        });
        for (let i in institutions) {
            const databases = await db.models.Member.findAll({
                attributes: ['database'],
                where: {
                    "institution": institutions[i].institution
                },
                group: "database"
            });
            for (let d in databases) {
                md["heeftDataset"].push({
                    "@id": config.eventstream.protocol + '://' + config.eventstream.hostname + port + '/' + path + institutions[i].institution + '/id/dataset/' +  md5(institutions[i].institution + databases[d].database),
                    "@type": "Dataset",
                    "Dataset.titel": databases[d].database + " van " + config[institutions[i].institution].institutionName,
                    "Dataset.beschrijving": "Event stream van de Adlib database '" + databases[d].database + "' van de instelling " + config[institutions[i].institution].institutionName,
                    "Dataset.heeftUitgever": config[institutions[i].institution].institutionURI,
                    "heeftDistributie": {
                        "@type": "Distributie",
                        "toegangsURL": config.eventstream.protocol + '://' + config.eventstream.hostname + port + '/' + path + institutions[i].institution + '/' + databases[d].database,
                        "dcterms:conformsTo": "https://w3id.org/tree"
                    }
                });
            }
        }
        res.send(JSON.stringify(md));
    } catch (e) {
        Utils.sendNotFound(req, res);
    }
}