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
                "prov": "http://www.w3.org/ns/prov#",
                "label": "http://www.w3.org/2000/01/rdf-schema#label",
                "opmerking": "http://www.w3.org/2004/02/skos/core#note",
                "foaf": "http://xmlns.com/foaf/0.1/",
                "foaf:page": {
                    "@type": "@id"
                }
            }
        ];
        this._adlibDatabase = options.adlibDatabase;
        this._institution = options.institution;
        this._institutionURI = config[options.institution].institutionURI;

        this._baseURI = config.mapping.baseURI;
    }
}


module.exports = ObjectMapper;