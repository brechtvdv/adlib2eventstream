const Utils = require('../lib/utils.js');
let Config = require("../config/config.js");
let config = Config.getConfig();
let md5 = require('md5');

let port = config.eventstream.port != '' ? ':' + config.eventstream.port : '';
let path = config.eventstream.path != '' ? config.eventstream.path + '/' : '';

const db = Utils.openDB(__dirname + "/../" + config.eventstream.database);
const numberOfObjectsPerFragment = 5;

module.exports.getDiscoveryMetadata = async function(req, res) {
    try {
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/ld+json'
        });

        let md = {
            "@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/DCAT-AP-VL/standaard/2019-06-13/context/DCAT-AP-VL.jsonld", {
                "dcterms": "http://purl.org/dc/terms/"
            }],
            "@id": config.eventstream.protocol + '://' + config.eventstream.hostname + port + '/' + config.eventstream.path + 'id/datasetcatalogus/coghent',
            "@type": "DatasetCatalogus",
            "DatasetCatalogus.titel": "Catalogus CoGhent",
            "DatasetCatalogus.beschrijving": "Catalogus van datasets voor de Collectie van de Gentenaar.",
            "heeftDataset": []
        };
        let institutions = await Utils.query(db, "SELECT distinct institution FROM Members");
        for (let i in institutions) {
            let databases = await Utils.query(db, "SELECT distinct database FROM Members WHERE institution='" + institutions[i].institution + "'");
            for (let d in databases) {
                md["heeftDataset"].push({
                    "@id": config.eventstream.protocol + '://' + config.eventstream.hostname + port + '/' + config.eventstream.path + institutions[i].institution + '/id/dataset/' +  md5(institutions[i].institution + databases[d].database),
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