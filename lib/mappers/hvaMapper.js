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
            let baseURI = this._baseURI.endsWith('/') ? this._baseURI : this._baseURI + '/';
            let objectURI = baseURI + "mensgemaaktobject" + '/' + this._institution + '/' + input["@attributes"].priref;
            let versionURI = objectURI + "/" + now;
            mappedObject["@id"] = versionURI;
            mappedObject["@type"] = "MensgemaaktObject";
            // Event stream metadata
            mappedObject["dcterms:isVersionOf"] = objectURI;
            // mappedObject["prov:generatedAtTime"] = new Date(input["@attributes"].modification).toISOString();
            mappedObject["prov:generatedAtTime"] = now;

            // Convenience method to make our URI dereferenceable by District09
            if (versionURI.indexOf('stad.gent/id') != -1) mappedObject["foaf:page"] = versionURI;

            // Identificatie
            utils.mapInstelling(this._institutionURI, input, mappedObject);
            utils.mapObjectnummer(input, mappedObject);
            utils.mapObjectCategorie(input, mappedObject);

            utils.mapObjectnaam(objectURI, input, mappedObject);
            utils.mapTitel(input, mappedObject);
            utils.mapBeschrijving(input, mappedObject);

            // Vervaardiging
            utils.mapVervaardiging(objectURI, input, mappedObject);

            // Associaties
            utils.mapAssociaties(objectURI, input, mappedObject);

            // iconografie
            utils.mapIconografie(input, mappedObject);

        } catch (e) {
            console.error(e);
        }
        done(null, JSON.stringify(mappedObject));
    }
}

module.exports = HvAMapper;