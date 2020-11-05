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

Make sure that a table is created for every adlib database you want to publish as an eventstream:
````
node_modules/db-migrate/bin/db-migrate create name_of_adlib_database --sql-file
````

Adapt the generated SQL files so there is a table with the name of the Adlib database and a table `"GeneratedAtTimeTo" + name of Adlib database`.
See also example for "objects" in the migrations folder.

Initialize all the tables:
```
node_modules/db-migrate/bin/db-migrate up
```

## Run

Rename `config.tml.example` to `config.tml` and fill in the password.
Run following command to start harvesting the Adlib database(s):

```
node bin/adlib2backend.js
```

When the SQLite database is empty, it will harvest all Adlib objects.
When this is not empty (when you run it as a cronjob), it will look up the latest harvested object and start fetching Adlib from that point on.

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
node bin/eventstream.js
```

**Request**

```
curl -X GET \
  http://localhost:3000/objecten?generatedAtTime=2020-11-03T09:42:28.000Z
```

**Response**

```
{
	"@context": {
		"prov": "http://www.w3.org/ns/prov#",
		"tree": "https://w3id.org/tree#",
		"sh": "http://www.w3.org/ns/shacl#",
		"tree:member": {
			"@type": "@id"
		},
		"tree:node": {
			"@type": "@id"
		}
	},
	"@id": "http://localhost:3000/objecten?generatedAtTime=2020-11-03T09:42:28.000Z",
	"@type": "tree:Node",
	"@included": [{
		"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld", "https://data.vlaanderen.be/context/persoon-basis.jsonld", "https://linked.art/ns/v1/linked-art.json", "https://data.vlaanderen.be/context/cultureel-erfgoed-event-ap.jsonld", {
			"dcterms:isVersionOf": {
				"@type": "@id"
			},
			"prov": "http://www.w3.org/ns/prov#"
		}],
		"@id": "https://example.org/object/id/470000055?generatedAtTime=2020-11-03T09:42:28.000Z",
		"@type": "MensgemaaktObject",
		"dcterms:isVersionOf": "https://example.org/object/id/470000055",
		"prov:generatedAtTime": "2020-11-03T09:42:28.000Z",
		"MensgemaaktObject.titel": "Boerenschroom"
	}, {
		"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld", "https://data.vlaanderen.be/context/persoon-basis.jsonld", "https://linked.art/ns/v1/linked-art.json", "https://data.vlaanderen.be/context/cultureel-erfgoed-event-ap.jsonld", {
			"dcterms:isVersionOf": {
				"@type": "@id"
			},
			"prov": "http://www.w3.org/ns/prov#"
		}],
		"@id": "https://example.org/object/id/470000149?generatedAtTime=2020-11-03T09:42:28.000Z",
		"@type": "MensgemaaktObject",
		"dcterms:isVersionOf": "https://example.org/object/id/470000149",
		"prov:generatedAtTime": "2020-11-03T09:42:28.000Z",
		"MensgemaaktObject.titel": "Behendigheidsspel met arabier"
	}, {
		"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld", "https://data.vlaanderen.be/context/persoon-basis.jsonld", "https://linked.art/ns/v1/linked-art.json", "https://data.vlaanderen.be/context/cultureel-erfgoed-event-ap.jsonld", {
			"dcterms:isVersionOf": {
				"@type": "@id"
			},
			"prov": "http://www.w3.org/ns/prov#"
		}],
		"@id": "https://example.org/object/id/470000151?generatedAtTime=2020-11-03T09:42:29.000Z",
		"@type": "MensgemaaktObject",
		"dcterms:isVersionOf": "https://example.org/object/id/470000151",
		"prov:generatedAtTime": "2020-11-03T09:42:29.000Z",
		"MensgemaaktObject.titel": "Geel meubilair voor poppenhuis"
	}, {
		"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld", "https://data.vlaanderen.be/context/persoon-basis.jsonld", "https://linked.art/ns/v1/linked-art.json", "https://data.vlaanderen.be/context/cultureel-erfgoed-event-ap.jsonld", {
			"dcterms:isVersionOf": {
				"@type": "@id"
			},
			"prov": "http://www.w3.org/ns/prov#"
		}],
		"@id": "https://example.org/object/id/470000206?generatedAtTime=2020-11-03T09:42:29.000Z",
		"@type": "MensgemaaktObject",
		"dcterms:isVersionOf": "https://example.org/object/id/470000206",
		"prov:generatedAtTime": "2020-11-03T09:42:29.000Z",
		"MensgemaaktObject.titel": "Badeend"
	}, {
		"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld", "https://data.vlaanderen.be/context/persoon-basis.jsonld", "https://linked.art/ns/v1/linked-art.json", "https://data.vlaanderen.be/context/cultureel-erfgoed-event-ap.jsonld", {
			"dcterms:isVersionOf": {
				"@type": "@id"
			},
			"prov": "http://www.w3.org/ns/prov#"
		}],
		"@id": "https://example.org/object/id/470000326?generatedAtTime=2020-11-03T09:42:30.000Z",
		"@type": "MensgemaaktObject",
		"dcterms:isVersionOf": "https://example.org/object/id/470000326",
		"prov:generatedAtTime": "2020-11-03T09:42:30.000Z",
		"MensgemaaktObject.titel": "Kaartspel van klein formaat"
	}, {
		"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld", "https://data.vlaanderen.be/context/persoon-basis.jsonld", "https://linked.art/ns/v1/linked-art.json", "https://data.vlaanderen.be/context/cultureel-erfgoed-event-ap.jsonld", {
			"dcterms:isVersionOf": {
				"@type": "@id"
			},
			"prov": "http://www.w3.org/ns/prov#"
		}],
		"@id": "https://example.org/object/id/470000407?generatedAtTime=2020-11-03T09:42:30.000Z",
		"@type": "MensgemaaktObject",
		"dcterms:isVersionOf": "https://example.org/object/id/470000407",
		"prov:generatedAtTime": "2020-11-03T09:42:30.000Z",
		"MensgemaaktObject.titel": "Le saut du boulet"
	}, {
		"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld", "https://data.vlaanderen.be/context/persoon-basis.jsonld", "https://linked.art/ns/v1/linked-art.json", "https://data.vlaanderen.be/context/cultureel-erfgoed-event-ap.jsonld", {
			"dcterms:isVersionOf": {
				"@type": "@id"
			},
			"prov": "http://www.w3.org/ns/prov#"
		}],
		"@id": "https://example.org/object/id/470000428?generatedAtTime=2020-11-03T09:42:31.000Z",
		"@type": "MensgemaaktObject",
		"dcterms:isVersionOf": "https://example.org/object/id/470000428",
		"prov:generatedAtTime": "2020-11-03T09:42:31.000Z",
		"MensgemaaktObject.titel": "Grijze ezel of paard"
	}, {
		"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld", "https://data.vlaanderen.be/context/persoon-basis.jsonld", "https://linked.art/ns/v1/linked-art.json", "https://data.vlaanderen.be/context/cultureel-erfgoed-event-ap.jsonld", {
			"dcterms:isVersionOf": {
				"@type": "@id"
			},
			"prov": "http://www.w3.org/ns/prov#"
		}],
		"@id": "https://example.org/object/id/470000437?generatedAtTime=2020-11-03T09:42:31.000Z",
		"@type": "MensgemaaktObject",
		"dcterms:isVersionOf": "https://example.org/object/id/470000437",
		"prov:generatedAtTime": "2020-11-03T09:42:31.000Z",
		"MensgemaaktObject.titel": "Filiberke"
	}, {
		"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld", "https://data.vlaanderen.be/context/persoon-basis.jsonld", "https://linked.art/ns/v1/linked-art.json", "https://data.vlaanderen.be/context/cultureel-erfgoed-event-ap.jsonld", {
			"dcterms:isVersionOf": {
				"@type": "@id"
			},
			"prov": "http://www.w3.org/ns/prov#"
		}],
		"@id": "https://example.org/object/id/470000449?generatedAtTime=2020-11-03T09:42:32.000Z",
		"@type": "MensgemaaktObject",
		"dcterms:isVersionOf": "https://example.org/object/id/470000449",
		"prov:generatedAtTime": "2020-11-03T09:42:32.000Z",
		"MensgemaaktObject.titel": "Stripfiguur Wiske"
	}, {
		"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld", "https://data.vlaanderen.be/context/persoon-basis.jsonld", "https://linked.art/ns/v1/linked-art.json", "https://data.vlaanderen.be/context/cultureel-erfgoed-event-ap.jsonld", {
			"dcterms:isVersionOf": {
				"@type": "@id"
			},
			"prov": "http://www.w3.org/ns/prov#"
		}],
		"@id": "https://example.org/object/id/470000449?generatedAtTime=2020-11-03T09:42:32.000Z",
		"@type": "MensgemaaktObject",
		"dcterms:isVersionOf": "https://example.org/object/id/470000449",
		"prov:generatedAtTime": "2020-11-03T09:42:32.000Z",
		"MensgemaaktObject.titel": "Stripfiguur Wiske"
	}, {
		"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld", "https://data.vlaanderen.be/context/persoon-basis.jsonld", "https://linked.art/ns/v1/linked-art.json", "https://data.vlaanderen.be/context/cultureel-erfgoed-event-ap.jsonld", {
			"dcterms:isVersionOf": {
				"@type": "@id"
			},
			"prov": "http://www.w3.org/ns/prov#"
		}],
		"@id": "https://example.org/object/id/470000485?generatedAtTime=2020-11-03T09:42:32.000Z",
		"@type": "MensgemaaktObject",
		"dcterms:isVersionOf": "https://example.org/object/id/470000485",
		"prov:generatedAtTime": "2020-11-03T09:42:32.000Z",
		"MensgemaaktObject.titel": "A bon Chat bon Rat"
	}, {
		"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld", "https://data.vlaanderen.be/context/persoon-basis.jsonld", "https://linked.art/ns/v1/linked-art.json", "https://data.vlaanderen.be/context/cultureel-erfgoed-event-ap.jsonld", {
			"dcterms:isVersionOf": {
				"@type": "@id"
			},
			"prov": "http://www.w3.org/ns/prov#"
		}],
		"@id": "https://example.org/object/id/470000486?generatedAtTime=2020-11-03T09:42:33.000Z",
		"@type": "MensgemaaktObject",
		"dcterms:isVersionOf": "https://example.org/object/id/470000486",
		"prov:generatedAtTime": "2020-11-03T09:42:33.000Z",
		"MensgemaaktObject.titel": "Speelgoedhuis"
	}, {
		"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld", "https://data.vlaanderen.be/context/persoon-basis.jsonld", "https://linked.art/ns/v1/linked-art.json", "https://data.vlaanderen.be/context/cultureel-erfgoed-event-ap.jsonld", {
			"dcterms:isVersionOf": {
				"@type": "@id"
			},
			"prov": "http://www.w3.org/ns/prov#"
		}],
		"@id": "https://example.org/object/id/470000487?generatedAtTime=2020-11-03T09:42:33.000Z",
		"@type": "MensgemaaktObject",
		"dcterms:isVersionOf": "https://example.org/object/id/470000487",
		"prov:generatedAtTime": "2020-11-03T09:42:33.000Z",
		"MensgemaaktObject.titel": "Speelgoedpiano Baby Grand"
	}, {
		"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld", "https://data.vlaanderen.be/context/persoon-basis.jsonld", "https://linked.art/ns/v1/linked-art.json", "https://data.vlaanderen.be/context/cultureel-erfgoed-event-ap.jsonld", {
			"dcterms:isVersionOf": {
				"@type": "@id"
			},
			"prov": "http://www.w3.org/ns/prov#"
		}],
		"@id": "https://example.org/object/id/470000583?generatedAtTime=2020-11-03T09:42:33.000Z",
		"@type": "MensgemaaktObject",
		"dcterms:isVersionOf": "https://example.org/object/id/470000583",
		"prov:generatedAtTime": "2020-11-03T09:42:33.000Z",
		"MensgemaaktObject.titel": "Het advertentiespel"
	}],
	"tree:relation": [{
		"@type": "tree:LessThanRelation",
		"tree:node": "http://localhost:3000/objecten?generatedAtTime=2019-05-22T00:00:29.000Z",
		"sh:path": "prov:generatedAtTime",
		"tree:value": "2020-11-03T09:42:28.000Z"
	}, {
		"@type": "tree:GreaterThanRelation",
		"tree:node": "http://localhost:3000/objecten?generatedAtTime=2020-11-03T09:42:33.000Z",
		"sh:path": "prov:generatedAtTime",
		"tree:value": "2020-11-03T09:42:32.000Z"
	}]
}
```