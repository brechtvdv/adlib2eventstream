import Adlib from '../lib/adlib.js';
import ObjectMapper from '../lib/mappers/objectMapper.js';
import SqliteBackend from '../lib/sqliteBackend.js';

const fs = require('fs');
const path = require('path');
let Config = require("../config/config.js");

start();

async function start() {
    let config = Config.getConfig();

    // Create eventstream "objects"
    let objectAdlib = new Adlib({"adlibDatabase": "objecten"});
    let objectMapper = new ObjectMapper();
    let objectSqliteBackend = new SqliteBackend({"adlibDatabase": "objecten"});
    objectAdlib.getStream().pipe(objectMapper).pipe(objectSqliteBackend);
}