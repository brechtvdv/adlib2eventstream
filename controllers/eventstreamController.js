const Utils = require('../lib/utils.js');
let Config = require("../config/config.js");
let config = Config.getConfig();
let md5 = require('md5');

let port = config.eventstream.port != '' ? ':' + config.eventstream.port : '';
let path = config.eventstream.path != '' ? config.eventstream.path + '/' : '';

const db = Utils.openDB(__dirname + "/../" + config.eventstream.database);
const numberOfObjectsPerFragment = 5;

module.exports.getEventstream = async function(req, res) {
    try {
        let adlibdatabase = req.params.adlibDatabase;
        let institution = req.params.institution;
        if (!config[institution]) {
            throw "institution not supported";
        }

        const baseURI = config.eventstream.protocol + '://' + config.eventstream.hostname + port + '/' + path + institution + '/' + adlibdatabase;

        let generatedAtTimeQueryParameter = new Date().toISOString();
        if (req.query.generatedAtTime) generatedAtTimeQueryParameter = req.query.generatedAtTime;
        const generatedAtTime = new Date(decodeURIComponent(generatedAtTimeQueryParameter));

        const generatedAtTimeTable = "GeneratedAtTimeToMembers";
        let table = "Members";

        const orderedGeneratedAtTimes = "WITH OrderedGeneratedAtTimes AS  \n" +
            "( \n" +
            "select generatedAtTime, institution, database, row_number() over () - 1 rownr\n" +
            "from " + generatedAtTimeTable + "\n" +
            "where institution=\"" + institution + "\"\n" +
            " AND database=\"" + adlibdatabase + "\"\n" +
            "group by generatedAtTime \n" +
            "order by generatedAtTime\n" +
            ")\n";

        let fr = await Utils.query(db, orderedGeneratedAtTimes +
            "select max(generatedAtTime) g \n" +
            "from " + generatedAtTimeTable + "\n" +
            "where generatedAtTime <= \"" + generatedAtTime.toISOString() + "\"\n" +
            " AND institution=\"" + institution + "\"\n" +
            " AND database=\"" + adlibdatabase + "\"\n" +
            " AND generatedAtTime IN (\n" +
            "select generatedAtTime\n" +
            "from OrderedGeneratedAtTimes\n" +
            "where rownr % " + numberOfObjectsPerFragment + "= 0\n" +
            ")");
        fr = fr[0].g;
        if (fr != null) fr = new Date(fr);
        else {
            throw "Fragment not found";
        }

        if (generatedAtTime.getTime() !== fr.getTime()) {
            // Redirect to correct fragment URL
            res.status = 302;
            res.redirect(baseURI + '?generatedAtTime=' + fr.toISOString());
            return;
        }

        let nextFr = await Utils.query(db, orderedGeneratedAtTimes +
            "select min(generatedAtTime) g \n" +
            "from OrderedGeneratedAtTimes\n" +
            "where rownr % " + numberOfObjectsPerFragment + "= 0 and generatedAtTime > \"" + fr.toISOString() + "\"\n" +
            " AND institution=\"" + institution + "\"\n" +
            " AND database=\"" + adlibdatabase + "\"\n");
        nextFr = nextFr[0].g;
        if (nextFr != null) nextFr = new Date(nextFr);

        if (nextFr != null) {
            // Cache older fragment that won't change over time
            res.set({ 'Cache-Control': 'public, max-age=31536000, immutable' });
            // res.set({ 'Cache-Control': 'public, max-age=30000' });
        } else {
            // Do not cache current fragment as it will get more data
            res.set({ 'Cache-Control': 'no-cache, no-store, must-revalidate' });
        }

        // add links to previous/next pages
        let prevFr = await Utils.query(db, orderedGeneratedAtTimes +
            "select max(generatedAtTime) g\n" +
            "from OrderedGeneratedAtTimes\n" +
            "where rownr % " + numberOfObjectsPerFragment + "= 0 and generatedAtTime < \"" + fr.toISOString() + "\"\n" +
            " AND institution=\"" + institution + "\"\n" +
            " AND database=\"" + adlibdatabase + "\"\n");
        prevFr = prevFr[0].g;
        if (prevFr != null) prevFr = new Date(prevFr);

        let relations = [];
        if (prevFr != null) {
            let prevRemainingItems = await Utils.query(db, "select count(1) c\n" +
                "from " + generatedAtTimeTable + "\n" +
                "where generatedAtTime < \"" + fr.toISOString() + "\"\n" +
                " AND institution=\"" + institution + "\"\n" +
                " AND database=\"" + adlibdatabase + "\"\n");
            prevRemainingItems = prevRemainingItems[0].c;
            // there is a previous relation
            relations.push({
                "@type": "tree:LessThanRelation",
                "tree:node": baseURI + '?generatedAtTime=' + prevFr.toISOString(),
                "tree:path": "prov:generatedAtTime",
                "tree:value": generatedAtTime,
                "tree:remainingItems": prevRemainingItems,
            })
        };
        if (nextFr != null) {
            // there is a next relation
            // fetch time of last object in fragment
            let lastDateTime = await Utils.query(db, orderedGeneratedAtTimes +
                "select max(generatedAtTime) g\n" +
                "from OrderedGeneratedAtTimes\n" +
                "where generatedAtTime < \"" + nextFr.toISOString() + "\"\n" +
                " AND institution=\"" + institution + "\"\n" +
                " AND database=\"" + adlibdatabase + "\"\n");
            lastDateTime = new Date(lastDateTime[0].g);
            let nextRemainingItems = await Utils.query(db, "select count(1) c\n" +
                "from " + generatedAtTimeTable + "\n" +
                "where generatedAtTime > \"" + lastDateTime.toISOString() + "\"\n" +
            " AND institution=\"" + institution + "\"\n" +
            " AND database=\"" + adlibdatabase + "\"\n");
            nextRemainingItems = nextRemainingItems[0].c;
            relations.push({
                "@type": "tree:GreaterThanRelation",
                "tree:node": baseURI + '?generatedAtTime=' + nextFr.toISOString(),
                "tree:path": "prov:generatedAtTime",
                "tree:value": lastDateTime,
                "tree:remainingItems": nextRemainingItems
            })
        };

        let collectionURI = config.eventstream.protocol + '://' + config.eventstream.hostname + port + '/' + path + institution + '/id/dataset/' +  md5(institution + adlibdatabase);
        let fragmentContent = {
            "@context": {
                "prov": "http://www.w3.org/ns/prov#",
                "tree": "https://w3id.org/tree#",
                "sh": "http://www.w3.org/ns/shacl#",
                "dcterms": "http://purl.org/dc/terms/",
                "tree:member": {
                    "@type": "@id"
                },
                "memberOf": {
                    "@reverse": "tree:member",
                    "@type": "@id"
                },
                "tree:node": {
                    "@type": "@id"
                },
                "viewOf": {
                    "@reverse": "tree:view",
                    "@type": "@id"
                }
            },
            "@id": baseURI + '?generatedAtTime=' + generatedAtTime.toISOString(),
            "@type": "tree:Node",
            "viewOf": {
                "@id": collectionURI,
                "@type": "tree:Collection"
            },
            "@included": []
        }
        if (relations.length) fragmentContent["tree:relation"] = relations;

        let json;
        let startGat = generatedAtTime.toISOString();
        let endGat = new Date().toISOString(); // now
        if (nextFr != null) endGat = nextFr.toISOString();

        // it's the latest fragment
        let payloads = await Utils.query(db,"select payload\n" +
            "from " + table + "\n" +
            "where URI IN (\n" +
            "\tselect URI\n" +
            "\tfrom " + generatedAtTimeTable + "\n" +
            "\twhere generatedAtTime BETWEEN '" + startGat + "' and '" + endGat + "'\n" +
            " AND institution=\"" + institution + "\"\n" +
            " AND database=\"" + adlibdatabase + "\"\n" +
            "\t)\n" +
            "\torder by generatedAtTime asc");

        for (let p in payloads) {
            try {
                json = JSON.parse(payloads[p].payload);
                // Add member relation to collection
                json["memberOf"] = collectionURI;
                fragmentContent["@included"].push(json);
            } catch (e) {
                console.log("Something wrong with " + p)
            }
        }
        res.send(JSON.stringify(fragmentContent));
    } catch (e) {
        Utils.sendNotFound(req, res);
    }
}

async function isDatabaseSupported(adlibdb) {
    let t = await Utils.query(db,"SELECT name FROM sqlite_master \n" +
        "WHERE type IN ('table','view') \n" +
        "AND name = $name;", {
        $name: adlibdb
    });
    return t.length>0;
}