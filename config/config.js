import fs from "fs";
let toml = require('toml');

module.exports.getConfig = function() {
    let data = toml.parse(fs.readFileSync("../config.tml").toString());
    return {
        adlib: {
            baseUrl: data.adlib.baseUrl,
            username: data.adlib.username,
            password: data.adlib.password,
            limit: data.adlib.limit,
            thesaurus: data.adlib.thesaurus,
            personen: data.adlib.personen
        },
        eventstream: {
            hostname: data.eventstream.hostname,
            port: data.eventstream.port,
            path: data.eventstream.path,
            database: data.eventstream.database,
            numberOfObjectsPerFragment: data.eventstream.numberOfObjectsPerFragment
        }
    };
};