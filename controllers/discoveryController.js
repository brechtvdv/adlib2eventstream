const Utils = require('../lib/utils.js');
let Config = require("../config/config.js");
let config = Config.getConfig();

let port = config.eventstream.port != '' ? ':' + config.eventstream.port : '';
let path = config.eventstream.path != '' ? config.eventstream.path + '/' : '';

const db = Utils.openDB("../" + config.eventstream.database);
const numberOfObjectsPerFragment = 5;

module.exports.getDiscoveryMetadata = async function(req, res) {
    try {
        let md = {
            "@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/DCAT-AP-VL/standaard/2019-06-13/context/DCAT-AP-VL.jsonld"],
            "@id": 'http://' + config.eventstream.hostname + port + '#datasetcatalogus',
            "@type": "DatasetCatalogus",
            "DatasetCatalogus.titel": "Catalogus CoGhent",
            "DatasetCatalogus.beschrijving": "Catalogus van datasets voor de Collectie van de Gentenaar.",
            "heeftDataset": []
        };
        let tablenames = await Utils.query(db, "SELECT name FROM sqlite_master \n" +
            "WHERE type IN ('table','view') \n" +
            "AND name NOT LIKE 'sqlite_%';");
        let toegangsURL;
        for (let t in tablenames) {
            if (tablenames[t].name.indexOf('GeneratedAtTimeTo') != -1)  {
                let dataset = tablenames[t].name.substring(17);
                md["heeftDataset"] = {
                    "@id": 'http://' + config.eventstream.hostname + port + '/' + config.eventstream.path + '#' + dataset,
                    "@type": "Dataset",
                    "Dataset.titel": "Adlib " + dataset,
                    "Dataset.beschrijving": "Dataset van de Adlib database \"" + dataset + "\"",
                    "heeftDistributie": {
                        "@type": "Distributie",
                        "toegangsURL": 'http://' + config.eventstream.hostname + port + '/' + config.eventstream.path + '/' + dataset
                    }
                }
            }
        }
        res.send(JSON.stringify(md));
    } catch (e) {
        let tablenames = await Utils.query(db, "SELECT name FROM sqlite_master \n" +
            "WHERE type IN ('table','view') \n" +
            "AND name NOT LIKE 'sqlite_%';");
        let response = '';
        for (let t in tablenames) {
            if (tablenames[t].name.indexOf('GeneratedAtTimeTo') != -1)  response += 'http://' + config.eventstream.hostname + port + '/' + path + tablenames[t].name.substring(17) + "\n"
        }
        res.status(404).send('Something went wrong. Discover more here: ' + response);
        return;
    }
}