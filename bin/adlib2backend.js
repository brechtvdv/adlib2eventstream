let Adlib = require('../lib/adlib.js');
let ObjectMapper = require('../lib/mappers/objectMapper.js');
let DmgMapper = require('../lib/mappers/dmgMapper');
let StamMapper = require('../lib/mappers/stamMapper');
const HvAMapper = require("../lib/mappers/hvaMapper");
const Backend = require("../lib/Backend");
const Utils = require('../lib/utils.js');
const config = require("../config/config.js").getConfig();

let sequelize;

let cron = require('node-cron');

const fs = require('fs');
const path = require('path');

start();

cron.schedule(config.adlib.schedule, () => {
    start();
});

async function start() {
    sequelize = await Utils.initDb();

    startHva();
    startDmg();
    //startIndustriemuseum();
   //startArchiefgent();
    startStam();
}

async function startHva() {
    let options = {
        "institution": "hva", // to retrieve name and URI from config
        "adlibDatabase": "objecten",
        "db": sequelize
    };
    const backend = new Backend(options);
    let objectAdlib = new Adlib(options);
    let objectMapper = new HvAMapper(options);
    objectAdlib.getStream().pipe(objectMapper).pipe(backend);
}

function startDmg() {
    let options = {
        "institution": "dmg", // to retrieve name and URI from config
        "adlibDatabase": "objecten",
        "db": sequelize
    };
    // Create eventstream "objects" of Design Museum Ghent
    const backend = new Backend(options);
    let objectAdlib = new Adlib(options);
    let objectMapper = new DmgMapper(options);
    objectAdlib.getStream().pipe(objectMapper).pipe(backend);
}

function startIndustriemuseum() {
    let options = {
        "institution": "industriemuseum", // to retrieve name and URI from config
        "adlibDatabase": "objecten",
        "db": sequelize
    };
    // Create eventstream "personen" of Industriemuseum
    const backend = new Backend(options);
    let objectAdlib = new Adlib(options);
    let objectMapper = new ObjectMapper(options);
    let objectSqliteBackend = new SqliteBackend(options);
    objectAdlib.getStream().pipe(objectMapper).pipe(backend);
}

function startArchiefgent() {
    let options = {
        "institution": "archiefgent", // to retrieve name and URI from config
        "adlibDatabase": "objecten",
        "db": sequelize
    };
    // Create eventstream "personen" of Archief Gent
    const backend = new Backend(options);
    let objectAdlib = new Adlib(options);
    let objectMapper = new ObjectMapper(options);
    objectAdlib.getStream().pipe(objectMapper).pipe(backend);
}

function startStam() {
    let options = {
        "institution": "stam", // to retrieve name and URI from config
        "adlibDatabase": "objecten",
        "db": sequelize
    };
    // Create eventstream "personen" of Stam
    const backend = new Backend(options);
    let objectAdlib = new Adlib(options);
    let objectMapper = new StamMapper(options);
    objectAdlib.getStream().pipe(objectMapper).pipe(backend);
}