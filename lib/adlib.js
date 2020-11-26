var httpntlm = require('httpntlm');
const { Readable } = require('stream');
let Config = require("../config/config.js");
let config = Config.getConfig();

const Utils = require('./utils.js');

class Adlib {
    constructor(options) {
        this._adlibDatabase = options.adlibDatabase;
        this._institution = options.institution;
        this._institutionName = config[options.institution].institutionName;

        this._eventstreamDbLocation = __dirname + "/../" + config.eventstream.database;

        this._db = Utils.openDB(this._eventstreamDbLocation);
        this.run();
        this._stream = new Readable({
            objectMode: true,
            read() {}
        });
    }
}

Adlib.prototype.getStream = function () {
    return this._stream;
}

Adlib.prototype.run = async function () {
    let config = Config.getConfig();

    let lastModifiedDate = null;
    let generatedAtTimes = await Utils.query(this._db, "SELECT * FROM GeneratedAtTimeToMembers WHERE institution='" + this._institution + "' and database='" + this._adlibDatabase + "' ORDER BY generatedAtTime DESC LIMIT 1;");
    if (generatedAtTimes.length) {
        // update lastModifiedDate
        lastModifiedDate = new Date(generatedAtTimes[0].generatedAtTime);
    }

    let startFrom = 0;
    await this.fetchWithNTLMRecursively(lastModifiedDate, startFrom, config.adlib.limit);
    console.log("All objects are fetched from Adlib!");
    this._stream.push(null);
}

Adlib.prototype.fetchWithNTLMRecursively = async function(lastModifiedDate, startFrom, limit) {
    await sleep(5000); // wait 5 seconds
    let querypath = "?output=json&database=" + this._adlibDatabase + "&startFrom=" + startFrom + "&limit=" + limit;
    if (lastModifiedDate) querypath = querypath + "&search=institution.name='" + this._institutionName + "' AND modification%20greater%20%27" + lastModifiedDate.toISOString() + "%27";
    else querypath = querypath + "&search=institution.name='" + this._institutionName + "'";
    let objects = await this.fetchWithNTLM(querypath);
    if(objects.adlibJSON.recordList.record.length) {
        for (let i in objects.adlibJSON.recordList.record) {
            this._stream.push(JSON.stringify(objects.adlibJSON.recordList.record[i]));
        }
        let hits = objects.adlibJSON.diagnostic.hits;
        console.log("number of hits: " + hits)
        let nextStartFrom = startFrom + limit;
        if (nextStartFrom < hits) await this.fetchWithNTLMRecursively(lastModifiedDate, nextStartFrom, limit);
    } else {
        return;
    }
}

Adlib.prototype.fetchWithNTLM = function(querypath) {
    console.log("fetching: " + querypath)
    return new Promise((resolve, reject) => {
        let config = Config.getConfig();

        httpntlm.get({
            url: config.adlib.baseUrl + querypath,
            username: config.adlib.username,
            password: config.adlib.password
        }, function (err, res) {
            if (err) reject(err);
            resolve(JSON.parse(res.body));
        });
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = Adlib ;