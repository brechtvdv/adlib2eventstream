let utils = require("./utils.js");
const ObjectMapper = require("./objectMapper");

class HvAMapper extends ObjectMapper {
    constructor(options) {
        super(options);
    }

    _transform(object, encoding, done) {
        let input = JSON.parse(object);
        let mappedObject = {};
        mappedObject["@context"] = this._context;

        try {
            let now = new Date().toISOString();
            let versionURI = this._baseURIObject + "/" + input["@attributes"].priref + "/" + now;
            // let versionURI = this._baseURIObject + "/" + input["@attributes"].priref + "/" + new Date(input["@attributes"].modification).toISOString();
            let objectURI = this._baseURICulturize + '/id/' + this._adlibDatabase + '/' + input["@attributes"].priref;
            mappedObject["@id"] = versionURI;
            mappedObject["@type"] = "MensgemaaktObject";
            // Event stream metadata
            mappedObject["dcterms:isVersionOf"] = objectURI;
            // mappedObject["prov:generatedAtTime"] = new Date(input["@attributes"].modification).toISOString();
            mappedObject["prov:generatedAtTime"] = now;

            // Identificatie
            utils.mapInstelling(this._institutionURI, input, mappedObject);
            utils.mapObjectnummer(input, mappedObject);
            utils.mapObjectCategorie(input, mappedObject);

            utils.mapObjectnaam(versionURI, input, mappedObject);
            utils.mapTitel(input, mappedObject);
            utils.mapBeschrijving(input, mappedObject);

            // Vervaardiging
            utils.mapVervaardiging(versionURI, input, mappedObject);

            // Associaties
            utils.mapAssociaties(versionURI, input, mappedObject);

            // iconografie
            utils.mapIconografie(input, mappedObject);

        } catch (e) {
            console.error(e);
        }
        done(null, JSON.stringify(mappedObject));
    }
}

module.exports = HvAMapper;