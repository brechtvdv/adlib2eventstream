const { Writable } = require('stream');
const Utils = require('./utils.js');
let Config = require("../config/config.js");

class SqliteBackend extends Writable {
    constructor(options) {
        super();
        let config = Config.getConfig();

        this._eventstreamDbLocation = __dirname + "/../" + config.eventstream.database;

        this._table = options.adlibDatabase;

        this._db = Utils.openDB(this._eventstreamDbLocation);
    }
}

SqliteBackend.prototype._write = function (chunk, encoding, done) {
    // write object  to file
    let object = JSON.parse(chunk);
    Utils.insertObject(this._db, object, this._table);
    done();
};

module.exports = SqliteBackend;