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
            "https://linked.art/ns/v1/linked-art.json",
            "https://brechtvdv.github.io/demo-data/cultureel-erfgoed-event-ap.jsonld",
            {
                "dcterms:isVersionOf": {
                    "@type": "@id"
                },
                "prov": "http://www.w3.org/ns/prov#"
            }
        ];
        this._adlibDatabase = options.adlibDatabase;
        this._baseURIObject = 'http://' + config.eventstream.hostname + port + '/' + path + this._adlibDatabase;
        this._baseURICulturize = 'http://example.org/';
    }

    _transform(object, encoding, done) {
        let input = JSON.parse(object);
        let mappedObject = {};
        mappedObject["@context"] = this._context;

        try {
            mappedObject["@id"] = this._baseURIObject + "?generatedAtTime=" + new Date(input["@attributes"].modification).toISOString() + "#" + input["@attributes"].priref;
            mappedObject["@type"] = "MensgemaaktObject";
            // Event stream metadata
            mappedObject["dcterms:isVersionOf"] = this._baseURICulturize + this._adlibDatabase + '/id/' + input["@attributes"].priref;
            mappedObject["prov:generatedAtTime"] = new Date(input["@attributes"].modification).toISOString();

            // General metadata
            if (input.Title && input.Title[0].title) mappedObject["MensgemaaktObject.titel"] = input.Title[0].title[0];

        } catch (e) {
            console.error(e);
        }
        done(null, JSON.stringify(mappedObject));
    }
}

module.exports = ObjectMapper;