let Adlib = require('../lib/adlib.js');
let ObjectMapper = require('../lib/mappers/objectMapper.js');
let DmgMapper = require('../lib/mappers/dmgMapper');
let StamMapper = require('../lib/mappers/stamMapper');
const HvAMapper = require("../lib/mappers/hvaMapper");

let SqliteBackend = require('../lib/sqliteBackend.js');

const fs = require('fs');
const path = require('path');

start();

async function start() {
   //startHva();
   //startDmg();
   //startIndustriemuseum();
   //startArchiefgent();
   startStam();
}

function startHva() {
    let options = {
        "institution": "hva", // to retrieve name and URI from config
        "adlibDatabase": "objecten"
    };
    // Create eventstream "objects" of Huis van Alijn
    let objectAdlib = new Adlib(options);
    let objectMapper = new HvAMapper(options);
    let objectSqliteBackend = new SqliteBackend(options);
    objectAdlib.getStream().pipe(objectMapper).pipe(objectSqliteBackend);
}

function startDmg() {
    let options = {
        "institution": "dmg", // to retrieve name and URI from config
        "adlibDatabase": "objecten"
    };
    // Create eventstream "objects" of Design Museum Ghent
    let objectAdlib = new Adlib(options);
    let objectMapper = new DmgMapper(options);
    let objectSqliteBackend = new SqliteBackend(options);
    objectAdlib.getStream().pipe(objectMapper).pipe(objectSqliteBackend);
}

function startIndustriemuseum() {
    let options = {
        "institution": "industriemuseum", // to retrieve name and URI from config
        "adlibDatabase": "objecten"
    };
    // Create eventstream "personen" of Industriemuseum
    let objectAdlib = new Adlib(options);
    let objectMapper = new ObjectMapper(options);
    let objectSqliteBackend = new SqliteBackend(options);
    objectAdlib.getStream().pipe(objectMapper).pipe(objectSqliteBackend);
}

function startArchiefgent() {
    let options = {
        "institution": "archiefgent", // to retrieve name and URI from config
        "adlibDatabase": "objecten"
    };
    // Create eventstream "personen" of Archief Gent
    let objectAdlib = new Adlib(options);
    let objectMapper = new ObjectMapper(options);
    let objectSqliteBackend = new SqliteBackend(options);
    objectAdlib.getStream().pipe(objectMapper).pipe(objectSqliteBackend);
}

function startStam() {
    let options = {
        "institution": "stam", // to retrieve name and URI from config
        "adlibDatabase": "objecten"
    };
    // Create eventstream "personen" of Stam
    let objectAdlib = new Adlib(options);
    let objectMapper = new StamMapper(options);
    let objectSqliteBackend = new SqliteBackend(options);
    objectAdlib.getStream().pipe(objectMapper).pipe(objectSqliteBackend);
}