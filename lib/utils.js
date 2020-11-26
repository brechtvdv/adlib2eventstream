const sqlite3 = require('sqlite3');
let Config = require("../config/config.js");
let config = Config.getConfig();
let port = config.eventstream.port != '' ? ':' + config.eventstream.port : '';
let path = config.eventstream.path != '' ? config.eventstream.path + '/' : '';

module.exports = new class Utils {
    openDB(location) {
        return new sqlite3.Database(location);
    }

    insertObject(institution, db, object, adlibDatabase) {
        let generatedAtTime = new Date(object["prov:generatedAtTime"]).toISOString();
        let URI = object["@id"];

        // reverse index table
        db.run("REPLACE INTO GeneratedAtTimeToMembers(institution, database, generatedAtTime, URI) VALUES ($institution, $database, $generatedAtTime, $URI)", {
            $institution: institution,
            $database: adlibDatabase,
            $generatedAtTime: generatedAtTime,
            $URI: URI
        });

        db.run("REPLACE INTO Members(URI, institution, database, generatedAtTime, payload) VALUES ($URI, $institution, $database, $generatedAtTime, $payload)", {
            $URI: URI,
            $institution: institution,
            $database: adlibDatabase,
            $generatedAtTime: generatedAtTime,
            $payload: JSON.stringify(object)
        });
    }

    query(db, sql, params = []) {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
    }

    sendNotFound(req, res) {
        res.set({
            'Content-Type': 'text/html'
        });
        let homepage = config.eventstream.protocol + '://' + config.eventstream.hostname + port + '/' + path;
        res.status(404).send('Not data found. Discover more here: <a href="' + homepage + '">' + homepage + '</a>');
    }
}