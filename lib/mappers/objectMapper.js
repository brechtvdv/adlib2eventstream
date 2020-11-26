const { Transform } = require('stream');
let Config = require("../../config/config.js");
let config = Config.getConfig();

let port = config.eventstream.port != '' ? ':' + config.eventstream.port : '';
let path = config.eventstream.path != '' ? config.eventstream.path + '/' : '';

class ObjectMapper extends Transform {
    constructor(options) {
        super({objectMode: true});

        this._context = ["https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld",
            "https://data.vlaanderen.be/context/persoon-basis.jsonld",
            "https://brechtvdv.github.io/demo-data/cultureel-erfgoed-event-ap.jsonld",
            {
                "dcterms:isVersionOf": {
                    "@type": "@id"
                },
                "prov": "http://www.w3.org/ns/prov#"
            }
        ];
        this._adlibDatabase = options.adlibDatabase;
        this._institution = options.institution;
        this._institutionURI = config[options.institution].institutionURI;

        this._baseURIObject = config.eventstream.protocol + '://' + config.eventstream.hostname + port + '/' + path + this._institution + '/id/' + this._adlibDatabase;
        this._baseURICulturize = 'http://example.org';
    }

    _transform(object, encoding, done) {
        let input = JSON.parse(object);
        let mappedObject = {};
        mappedObject["@context"] = this._context;

        try {
            mappedObject["@id"] = this._baseURIObject + "/" + input["@attributes"].priref + "/" + new Date(input["@attributes"].modification).toISOString();
            mappedObject["@type"] = "MensgemaaktObject";
            // Event stream metadata
            mappedObject["dcterms:isVersionOf"] = this._baseURICulturize + '/id/' + this._adlibDatabase + '/' + input["@attributes"].priref;
            mappedObject["prov:generatedAtTime"] = new Date(input["@attributes"].modification).toISOString();
            mappedObject["MaterieelDing.beheerder"] = this._institutionURI;

            // General metadata
            if (input.Title && input.Title[0].title) mappedObject["MensgemaaktObject.titel"] = input.Title[0].title[0];

            if(input.Condition && input.Condition[0]) mappedObject["MaterieelDing.conditiebeoordeling"] = processCondition(mappedObject["dcterms:isVersionOf"], input.Condition[0]);

            if(input.Current_location && input.Current_location[0] && input.Current_location[0].current_location) mappedObject["MensgemaaktObject.locatie"] = input.Current_location[0].current_location[0];

            mappedObject["MaterieelDing.productie"] = processProduction(mappedObject["dcterms:isVersionOf"], input);

            if(input.Material && input.Material[0]) mappedObject["MensgemaaktObject.materiaal"] = processMaterial(input)

            if(input.Object_name && input.Object_name[0]) mappedObject["Entiteit.classificatie"] = processClassification(mappedObject["dcterms:isVersionOf"], input)
        } catch (e) {
            console.error(e);
        }
        done(null, JSON.stringify(mappedObject));
    }
}

function processCondition(id, condition) {
    let c = {
        "@type": "Conditiebeoordeling",
        "conditie_van": id
    }
    if (condition["condition"]) {
        c["Conditiebeoordeling.vastgesteldeStaat"] = {
            "@type": "Conditie",
            "Conditie.nota": condition["condition"][0]
        }
    }

    if (condition["condition.date"] && condition["condition.date"][0] != "") {
        c["Conditie.periode"] = {
            "@type": "Periode",
            "Periode.begin": condition["condition.date"][0].begin,
            "Periode.einde": condition["condition.date"][0].end
        }
    }
    return c;
}

function processProduction(id, input) {
    let p = {
        "@type": "Productie",
        "Productie.product": id
    };

    if(input.Production_date && input.Production_date[0]) {
        p["Gebeurtenis.tijd"] = {
            "@type": "Periode"
        }
        if(input.Production_date[0]['production.date.start']) p["Gebeurtenis.tijd"]["Periode.begin"] = input.Production_date[0]['production.date.start'][0];
        if (input.Production_date[0]['production.date.end']) p["Gebeurtenis.tijd"]["Periode.einde"] = input.Production_date[0]['production.date.end'][0]
    }

    if(input.Production && input.Production[0]) {
        if (input.Production[0]["production.place"]) p["Gebeurtenis.plaats"] = input.Production[0]["production.place"][0];
        if (input.Production[0]["creator"]) p["Activiteit.uitgevoerdDoor"] = {
            "@type": "Persoon",
            "volledigeNaam": input.Production[0]["creator"][0]
        }
    }
    return p;
}

function processMaterial(input) {
    let m = [];
    for(let mat in input.Material) {
        if (input.Material[mat].material) m.push({
            "http://www.w3.org/2000/01/rdf-schema#label": input.Material[mat].material[0]
        })
    }
    return m;
}

function processClassification(id, input) {
    let c = [];
    for(let o in input.Object_name) {
        c.push({
            "@type": "Classificatie",
            "Classificatie.getypeerdeEntiteit": id,
            "Classificatie.toegekendType": {
                "http://www.w3.org/2000/01/rdf-schema#label": input.Object_name[o].object_name[0]
            }
        })
    }
    return c;
}

module.exports = ObjectMapper;