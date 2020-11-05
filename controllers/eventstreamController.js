const Utils = require('../lib/utils.js');
let Config = require("../config/config.js");
let config = Config.getConfig();

let port = config.eventstream.port != '' ? ':' + config.eventstream.port : '';
let path = config.eventstream.path != '' ? config.eventstream.path + '/' : '';

const db = Utils.openDB("../" + config.eventstream.database);
const numberOfObjectsPerFragment = 5;

module.exports.getEventstream = async function(req, res) {
    try {
        let adlibdatabase = req.params.adlibDatabase;
        let isSupported = await isDatabaseSupported(adlibdatabase);
        if (!isSupported) throw("Database not supported")

        let table = adlibdatabase;
        const baseURI = 'http://' + config.eventstream.hostname + port + '/' + path + adlibdatabase;

        let generatedAtTimeQueryParameter = new Date().toISOString();
        if (req.query.generatedAtTime) generatedAtTimeQueryParameter = req.query.generatedAtTime;
        const generatedAtTime = new Date(decodeURIComponent(generatedAtTimeQueryParameter));

        const generatedAtTimeTable = "GeneratedAtTimeTo" + table;

        const orderedGeneratedAtTimes = "WITH OrderedGeneratedAtTimes AS  \n" +
            "( \n" +
            "select generatedAtTime, row_number() over () - 1 rownr\n" +
            "from " + generatedAtTimeTable + "\n" +
            "group by generatedAtTime \n" +
            "order by generatedAtTime\n" +
            ")\n";

        let fr = await Utils.query(db, orderedGeneratedAtTimes +
            "select max(generatedAtTime) g \n" +
            "from " + generatedAtTimeTable + "\n" +
            "where generatedAtTime <= \"" + generatedAtTime.toISOString() + "\" and generatedAtTime IN (\n" +
            "select generatedAtTime\n" +
            "from OrderedGeneratedAtTimes\n" +
            "where rownr % " + numberOfObjectsPerFragment + "= 0\n" +
            ")");
        fr = fr[0].g;
        if (fr != null) fr = new Date(fr);
        else {
            res.status("404");
            res.send("Fragment problem");
            return;
        }

        if (generatedAtTime.getTime() !== fr.getTime()) {
            // Redirect to correct fragment URL
            res.status = 302;
            res.redirect(baseURI + '?generatedAtTime=' + fr.toISOString());
            return;
        }

        res.set({
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/ld+json'
        });

        let nextFr = await Utils.query(db, orderedGeneratedAtTimes +
            "select min(generatedAtTime) g \n" +
            "from OrderedGeneratedAtTimes\n" +
            "where rownr % " + numberOfObjectsPerFragment + "= 0 and generatedAtTime > \"" + fr.toISOString() + "\"");
        nextFr = nextFr[0].g;
        if (nextFr != null) nextFr = new Date(nextFr);

        if (nextFr != null) {
            // Cache older fragment that won't change over time
            // Do not make it completely immutable if the mapping is not fixed
            // res.set({ 'Cache-Control': 'public, max-age=31536000, immutable' });
            res.set({ 'Cache-Control': 'public, max-age=30000' });
        } else {
            // Do not cache current fragment as it will get more data
            res.set({ 'Cache-Control': 'no-cache, no-store, must-revalidate' });
        }

        // add links to previous/next pages
        let prevFr = await Utils.query(db, orderedGeneratedAtTimes +
            "select max(generatedAtTime) g\n" +
            "from OrderedGeneratedAtTimes\n" +
            "where rownr % " + numberOfObjectsPerFragment + "= 0 and generatedAtTime < \"" + fr.toISOString() + "\"");
        prevFr = prevFr[0].g;
        if (prevFr != null) prevFr = new Date(prevFr);

        let relations = [];
        if (prevFr != null) {
            let prevRemainingItems = await Utils.query(db, "select count(1) c\n" +
                "from " + generatedAtTimeTable + "\n" +
                "where generatedAtTime < \"" + fr.toISOString() + "\"");
            prevRemainingItems = prevRemainingItems[0].c;
            // there is a previous relation
            relations.push({
                "@type": "tree:LessThanRelation",
                "tree:node": baseURI + "?generatedAtTime=" + prevFr.toISOString(),
                "sh:path": "prov:generatedAtTime",
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
                "where generatedAtTime < \"" + nextFr.toISOString() + "\"");
            lastDateTime = new Date(lastDateTime[0].g);
            let nextRemainingItems = await Utils.query(db, "select count(1) c\n" +
                "from " + generatedAtTimeTable + "\n" +
                "where generatedAtTime > \"" + lastDateTime.toISOString() + "\"");
            nextRemainingItems = nextRemainingItems[0].c;
            relations.push({
                "@type": "tree:GreaterThanRelation",
                "tree:node": baseURI + "?generatedAtTime=" + nextFr.toISOString(),
                "sh:path": "prov:generatedAtTime",
                "tree:value": lastDateTime,
                "tree:remainingItems": nextRemainingItems
            })
        };

        let collectionURI = 'http://' + config.eventstream.hostname + port + '#' + adlibdatabase;
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
                }
            },
            "@id": baseURI + '?generatedAtTime=' + generatedAtTime.toISOString(),
            "@type": "tree:Node",
            "dcterms:isPartOf": {
                "@id": collectionURI,
                "@type": "tree:Collection",
                "tree:view": baseURI
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
        let tablenames = await Utils.query(db, "SELECT name FROM sqlite_master \n" +
            "WHERE type IN ('table','view') \n" +
            "AND name NOT LIKE 'sqlite_%';");
        let response = '';
        for (let t in tablenames) {
            if (tablenames[t].name.indexOf('GeneratedAtTimeTo') != -1)  response += 'http://' + config.eventstream.hostname + port + '/' + path + tablenames[t].name.substring(17) + "\n"
        }
        res.status(404).send('Not data found. Discover more here: ' + response);
        return;
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