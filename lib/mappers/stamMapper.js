let utils = require("./utils.js");
const ObjectMapper = require("./objectMapper");

class StamMapper extends ObjectMapper {
    constructor(options) {
        super(options);
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
            await utils.mapObjectnaam(objectURI, input, mappedObject, this._adlib);
            await utils.mapObjectCategorie(objectURI, input, mappedObject, this._adlib);
            utils.mapTitel(input, mappedObject);
            utils.mapBeschrijving(input, mappedObject);

            // Vervaardiging | datering
            await utils.mapVervaardiging(objectURI, input, mappedObject, this._adlib);

            // Fysieke kenmerken
            await utils.mapFysiekeKenmerken(input, mappedObject, this._adlib);

            // Verwerving
            await utils.mapVerwerving(objectURI, this._institutionURI, input, mappedObject, this._adlib);

        } catch (e) {
            console.error(e);
        }
        done(null, JSON.stringify(mappedObject));
    }
}

module.exports = StamMapper;