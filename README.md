# adlib2eventstream

adlib2eventstream exposes Adlib databases as [event streams*](https://github.com/TREEcg/specification/tree/master/examples/eventstreams).

This is done in two steps:
* First, an Adlib database is fetched, mapped to Linked Data and stored inside a SQLite database
* Then, Linked Data Fragments are exposed on top of this SQLite database following the Eventstream [specification](https://github.com/TREEcg/specification/tree/master/examples/eventstreams).

\* an event stream is a collection of versioned objects (a version is like an event) and can be updated anytime at their own pace (slow and fast data). This way, consumers can easily discover and harvest the latest changes.

## Install

```
git clone https://github.com/brechtvdv/adlib2eventstream.git
cd adlib2eventstream
npm install
```

## Create SQLite database

```
node_modules/db-migrate/bin/db-migrate db:create evenstream
```

Initialize all the tables:
```
node_modules/db-migrate/bin/db-migrate up
```

## Run

Rename `config.tml.example` to `config.tml` and fill in the password.
Adapt the block `[institution]` with the name (or abbreviation) of the institution that will have its data published and fill in:
* `institutionName` with the exact spelling (`institution.name` field) used in Adlib
* `institutionURI` with a URI of the organization

`[institution]` will be used as a subpath of the Web API.

Adapt the option object inside `adlib2backend.js` file so that the value of `institution` matches with `[institution]` of the configuration file.

Run following command to start harvesting the Adlib database(s):

```
node bin/adlib2backend.js
```

When the SQLite database is empty, it will harvest all Adlib objects.
When this is not empty (when you run it as a cronjob), it will look up the latest harvested object and start fetching Adlib from that point on.

## Cronjob

Sync every day with Adlib at 1am in the morning:

```
0 1 * * * cd path/to/adlib2eventstream && node bin/adlib2backend.js
```

## Clean database

If you update the mapping of the eventstream, you need to refresh the whole database.
Run the db-migrate down command to clean the database:

```
node_modules/db-migrate/bin/db-migrate down
node_modules/db-migrate/bin/db-migrate up
```

## Eventstream API

After harvesting Adlib, the Evenstream API can be deployed to serve cacheable fragments:

```
PORT=3000 node bin/eventstream.js
```

When deploying this on a server, configure `config.tml` to match the hostname, port and relative path that is exposed to the outside.
To deploy you can use PM2:

```
npm install pm2@latest -g
PORT=3000 pm2 start evenstream.js --name "eventstream" --update-env
```

**Discover the collections**

```
curl -X GET \
  https://lodi.ilabt.imec.be/coghent/
```

**Response**

```
{
	"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/DCAT-AP-VL/standaard/2019-06-13/context/DCAT-AP-VL.jsonld"],
	"@id": "http://lodi.ilabt.imec.be/coghent#datasetcatalogus",
	"@type": "DatasetCatalogus",
	"DatasetCatalogus.titel": "Catalogus CoGhent",
	"DatasetCatalogus.beschrijving": "Catalogus van datasets voor de Collectie van de Gentenaar.",
	"heeftDataset": {
		"@id": "http://lodi.ilabt.imec.be/coghent#objecten",
		"@type": "Dataset",
		"Dataset.titel": "Adlib objecten",
		"Dataset.beschrijving": "Dataset van de Adlib database \"objecten\"",
		"heeftDistributie": {
			"@type": "Distributie",
			"toegangsURL": "http://lodi.ilabt.imec.be/coghent/objecten"
		}
	}
}
```

**Retrieve collection**

```
curl -X GET \
  https://lodi.ilabt.imec.be/coghent/objecten
```

**Response**

```
{
	"@context": {
		"prov": "http://www.w3.org/ns/prov#",
		"tree": "https://w3id.org/tree#",
		"sh": "http://www.w3.org/ns/shacl#",
		"dcterms": "http://purl.org/dc/terms/",
		"tree:member": {
			"@type": "@id"
		},
		"memberOf": {
			"@reverse": "tree:member",
			"@type": "@id"
		},
		"tree:node": {
			"@type": "@id"
		}
	},
	"@id": "http://lodi.ilabt.imec.be/coghent/objecten?generatedAtTime=2020-11-03T09:42:32.000Z",
	"@type": "tree:Node",
	"dcterms:isPartOf": {
		"@id": "http://lodi.ilabt.imec.be/coghent#objecten",
		"@type": "tree:Collection",
		"tree:view": "http://lodi.ilabt.imec.be/coghent/objecten"
	},
	"@included": [{
		"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld", "https://data.vlaanderen.be/context/persoon-basis.jsonld", "https://linked.art/ns/v1/linked-art.json", "https://brechtvdv.github.io/demo-data/cultureel-erfgoed-event-ap.jsonld", {
			"dcterms:isVersionOf": {
				"@type": "@id"
			},
			"prov": "http://www.w3.org/ns/prov#"
		}],
		"@id": "http://lodi.ilabt.imec.be/coghent/objecten?generatedAtTime=2020-11-03T09:42:32.000Z#470000449",
		"@type": "MensgemaaktObject",
		"dcterms:isVersionOf": "http://example.org/objecten/id/470000449",
		"prov:generatedAtTime": "2020-11-03T09:42:32.000Z",
		"MensgemaaktObject.titel": "Stripfiguur Wiske",
		"memberOf": "http://lodi.ilabt.imec.be/coghent#objecten"
	}],
	"tree:relation": [{
		"@type": "tree:LessThanRelation",
		"tree:node": "http://lodi.ilabt.imec.be/coghent/objecten?generatedAtTime=2020-11-03T09:42:27.000Z",
		"sh:path": "prov:generatedAtTime",
		"tree:value": "2020-11-03T09:42:32.000Z",
		"tree:remainingItems": 174
	}]
}
```
