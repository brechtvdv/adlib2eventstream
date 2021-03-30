const { Transform } = require('stream');
let config = require("../../config/config.js").getConfig();
let Adlib = require('../adlib.js');
const Utils = require('../utils');

let port = config.eventstream.port != '' ? ':' + config.eventstream.port : '';
let path = config.eventstream.path != '' ? config.eventstream.path + '/' : '';

class ThesaurusMapper extends Transform {
    constructor(options) {
        super({objectMode: true});

        this._context = [
            "https://data.vlaanderen.be/context/persoon-basis.jsonld",
            {
               "skos": "http://www.w3.org/2004/02/skos/core#",
                "owl": "http://www.w3.org/2002/07/owl#"
            }
        ];
        this._adlibDatabase = options.adlibDatabase;
        this._institution = options.institution;
        this._institutionURI = config[options.institution] ? config[options.institution].institutionURI : "";

        this._baseURI = config.mapping.baseURI.endsWith('/') ? config.mapping.baseURI : `${config.mapping.baseURI}/` ;

        this._type = options.type ? options.type : "";
        this._adlib = options.adlib;

        this._conceptscheme = `${this._baseURI}conceptscheme/${this._adlibDatabase}`;
    }

    _transform(object, encoding, done) {
        let input = JSON.parse(object);
        this.doMapping(input, done);
    }

    async doMapping(input, done) {
        let mappedObject = {};
        mappedObject["@context"] = this._context;

        try {
            let now = new Date().toISOString();
            let baseURI = this._baseURI.endsWith('/') ? this._baseURI : this._baseURI + '/';
            const priref = input["@attributes"].priref;

            // URI template: https://stad.gent/id/{type}/{scheme-id}/{concept-ref}
            let objectURI = baseURI + this._type + "/" + this._adlibDatabase + "/" + priref;
            let versionURI = objectURI + "/" + now;

            mappedObject["@id"] = versionURI;
            if (this._adlibDatabase === "personen") mappedObject["@type"] = "Agent"
            else mappedObject["@type"] = "skos:Concept";
            // Event stream metadata
            mappedObject["dcterms:isVersionOf"] = objectURI;
            mappedObject["prov:generatedAtTime"] = now;

            const uri = Utils.getURIFromRecord(input, priref, this._type, this._adlibDatabase);

            // External URI found
            if (uri != objectURI) mappedObject["owl:sameAs"] = uri;

            if (input['scope_note']) mappedObject["skos:definition"] = input['scope_note'][0];

            if (input['term']) {
                mappedObject["skos:prefLabel"] = {
                    "@value": input['term'][0],
                    "@language": "nl"
                }
            } else if (input['name']) {
                mappedObject["skos:prefLabel"] = {
                    "@value": input['name'][0],
                    "@language": "nl"
                }
            }

            mappedObject["skos:inscheme"] = this._conceptscheme;

            if (input['broader_term.lref'] && input['broader_term.lref'][0]) {
                mappedObject["skos:broader"] = [];
                for (let b in input['broader_term.lref']) {
                    const broaderPriref = input['broader_term.lref'][b];
                    const broaderTerm = input['broader_term'][b];
                    const broaderURI = Utils.getURIFromRecord(null, broaderPriref, 'concept', this._adlibDatabase);
                    mappedObject["skos:broader"].push({
                        "@id": broaderURI,
                        "skos:prefLabel": {
                            "@value": broaderTerm,
                            "@language": "nl"
                        }
                    })
                }
            }

            if (input['narrower_term.lref'] && input['narrower_term.lref'][0]) {
                mappedObject["skos:narrower"] = [];
                for (let b in input['narrower_term.lref']) {
                    const narrowerPriref = input['narrower_term.lref'][b];
                    const narrowerTerm = input['narrower_term'][b];
                    const narrowerURI = Utils.getURIFromRecord(null, narrowerPriref, 'concept', this._adlibDatabase);
                    mappedObject["skos:narrower"].push({
                        "@id": narrowerURI,
                        "skos:prefLabel": {
                            "@value": narrowerTerm,
                            "@language": "nl"
                        }
                    })
                }
            }

        } catch (e) {
            console.error(e);
        }

        done(null, JSON.stringify(mappedObject));
    }
}


module.exports = ThesaurusMapper;