let Adlib = require('../lib/adlib.js');
let ObjectMapper = require('../lib/mappers/objectMapper.js');
let SqliteBackend = require('../lib/sqliteBackend.js');

const fs = require('fs');
const path = require('path');
let Config = require("../config/config.js");

start();

async function start() {
    let config = Config.getConfig();

    let options = {"adlibDatabase": "objecten"};
    // Create eventstream "objects"
    let objectAdlib = new Adlib(options);
    let objectMapper = new ObjectMapper(options);
    let objectSqliteBackend = new SqliteBackend(options);
    objectAdlib.getStream().pipe(objectMapper).pipe(objectSqliteBackend);
}