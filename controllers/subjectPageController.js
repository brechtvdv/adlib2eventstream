const Utils = require('../lib/utils.js');
let Config = require("../config/config.js");
let config = Config.getConfig();

let port = config.eventstream.port != '' ? ':' + config.eventstream.port : '';
let path = config.eventstream.path != '' ? config.eventstream.path + '/' : '';

const db = Utils.openDB(__dirname + "/../" + config.eventstream.database);

module.exports.getSubjectPageOfMember = async function(req, res) {
    let objectURI = config.eventstream.protocol + '://' + config.eventstream.hostname + port + '/' + path + req.url.substr(1);

    let object = await Utils.query(db, "SELECT payload FROM Members WHERE URI='" + objectURI + "'");
    if (object.length) {
        res.send(object[0].payload);
    } else {
        Utils.sendNotFound(req, res);
    }
}