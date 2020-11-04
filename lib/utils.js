const sqlite3 = require('sqlite3');

module.exports = new class Utils {

    openDB(location) {
        return new sqlite3.Database(location);
    }

    insertObject(db, object, table) {
        let generatedAtTime = new Date(object["prov:generatedAtTime"]).toISOString();
        let URI = object["@id"];
        // reverse index table

        db.run("REPLACE INTO GeneratedAtTimeTo" + table + "(generatedAtTime, URI) VALUES ($generatedAtTime, $URI)", {
            $generatedAtTime: generatedAtTime,
            $URI: URI
        });

        db.run("REPLACE INTO " + table + "(URI, generatedAtTime, payload) VALUES ($URI, $generatedAtTime, $payload)", {
            $URI: URI,
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
}