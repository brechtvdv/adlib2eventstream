var httpntlm = require('httpntlm');
const { Readable } = require('stream');
let config = require("../config/config.js").getConfig();

const Utils = require('./utils.js');

class Adlib {
    constructor(options) {
        this._adlibDatabase = options.adlibDatabase;
        this._institution = options.institution;
        this._institutionName = config[options.institution].institutionName;

        this._db = options.db;
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
    var institution = this._institution;
    var adlibDatabase = this._adlibDatabase;
    let lastModifiedDate = null;
    let generatedAtTimes = await this._db.models.Member.findAll({
        where: {
            institution: institution,
            database: adlibDatabase
        },
        order: [
            ['generatedAtTime', 'DESC']
        ]
    });
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
    querypath = querypath + " AND webpublication=EUROPEANA";
    let objects = await this.fetchWithNTLM(querypath);
    if(objects.adlibJSON.diagnostic.hits_on_display != "0" && objects.adlibJSON.recordList) {
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
        httpntlm.get({
            url: config.adlib.baseUrl + querypath,
            username: config.adlib.username,
            password: config.adlib.password
        }, function (err, res) {
            if (err) reject(err);
            if (res.body) resolve(JSON.parse(res.body));
            else this.fetchWithNTLM(querypath); // retry
        });
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = Adlib ;