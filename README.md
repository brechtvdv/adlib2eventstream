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
PORT=3000 pm2 start bin/eventstream.js --name "eventstream" --update-env
```

**Discover the collections**

```
curl -X GET \
  https://lodi.ilabt.imec.be/coghent/
```

**Response**

```
{
	"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/DCAT-AP-VL/standaard/2019-06-13/context/DCAT-AP-VL.jsonld", {
		"dcterms": "http://purl.org/dc/terms/"
	}],
	"@id": "https://lodi.ilabt.imec.be/coghent/id/datasetcatalogus/coghent",
	"@type": "DatasetCatalogus",
	"DatasetCatalogus.titel": "Catalogus CoGhent",
	"DatasetCatalogus.beschrijving": "Catalogus van datasets voor de Collectie van de Gentenaar.",
	"heeftDataset": [{
		"@id": "https://lodi.ilabt.imec.be/coghent/dmg/id/dataset/206d69c469151306d018140d6a5345e6",
		"@type": "Dataset",
		"Dataset.titel": "objecten van Design Museum Gent",
		"Dataset.beschrijving": "Event stream van de Adlib database 'objecten' van de instelling Design Museum Gent",
		"Dataset.heeftUitgever": "http://www.wikidata.org/entity/Q1809071",
		"heeftDistributie": {
			"@type": "Distributie",
			"toegangsURL": "https://lodi.ilabt.imec.be/coghent/dmg/objecten",
			"dcterms:conformsTo": "https://w3id.org/tree"
		}
	}]
}
```

**Retrieve collection**

```
curl -X GET \
  https://lodi.ilabt.imec.be/coghent/dmg/objecten
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
		},
		"viewOf": {
			"@reverse": "tree:view",
			"@type": "@id"
		}
	},
	"@id": "https://lodi.ilabt.imec.be/coghent/dmg/objecten?generatedAtTime=2021-02-03T15:48:18.091Z",
	"@type": "tree:Node",
	"viewOf": {
		"@id": "https://lodi.ilabt.imec.be/coghent/dmg/id/dataset/206d69c469151306d018140d6a5345e6",
		"@type": "tree:Collection"
	},
	"@included": [{
		"@context": ["https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld", "https://data.vlaanderen.be/context/persoon-basis.jsonld", "https://brechtvdv.github.io/demo-data/cultureel-erfgoed-event-ap.jsonld", {
			"dcterms:isVersionOf": {
				"@type": "@id"
			},
			"prov": "http://www.w3.org/ns/prov#",
			"label": "http://www.w3.org/2000/01/rdf-schema#label",
			"opmerking": "http://www.w3.org/2004/02/skos/core#note"
		}],
		"@id": "https://lodi.ilabt.imec.be/coghent/dmg/id/objecten/530026088/2021-02-03T15:48:18.091Z",
		"@type": "MensgemaaktObject",
		"dcterms:isVersionOf": "http://example.org/id/objecten/530026088",
		"prov:generatedAtTime": "2021-02-03T15:48:18.091Z",
		"MaterieelDing.beheerder": "http://www.wikidata.org/entity/Q1809071",
		"MensgemaaktObject.maaktDeelUitVan": [{
			"@type": "Collectie",
			"Entiteit.beschrijving": "huishoudelijke apparaten (ok)"
		}, {
			"@type": "Collectie",
			"Entiteit.beschrijving": "Nova"
		}],
		"Object.identificator": {
			"@type": "Identificator",
			"Identificator.identificator": ["2017-0448"]
		},
		"Entiteit.classificatie": [{
			"@type": "Classificatie",
			"Classificatie.getypeerdeEntiteit": "https://lodi.ilabt.imec.be/coghent/dmg/id/objecten/530026088/2021-02-03T15:48:18.091Z",
			"Classificatie.toegekendType": {
				"label": "wafelijzer"
			}
		}, {
			"@type": "Classificatie",
			"Classificatie.getypeerdeEntiteit": "https://lodi.ilabt.imec.be/coghent/dmg/id/objecten/530026088/2021-02-03T15:48:18.091Z",
			"Classificatie.toegekendType": {
				"label": "dummy"
			}
		}],
		"MensgemaaktObject.titel": {
			"@value": "Dummy van Croc'Seconde Plus (Classic Line)",
			"@language": "nl"
		},
		"Entiteit.beschrijving": {
			"@value": "Model voor de uitvoering van een croc-toestel. Deze dummy werd naar alle waarschijnlijkheid gemaakt door Karl D'Hulst, stagiair industriële vormgeving bij Nova in 1985. Voor zijn stage-opdracht diende hij een stylingmodel te ontwerpen waarvoor er tevens een dummy diende te worden gemaakt.",
			"@language": "nl"
		},
		"MensgemaaktObject.materiaal": [{
			"label": "geheel: polymethacrylimide (pp)"
		}],
		"MensgemaaktObject.dimensie": [{
			"@type": "Dimensie",
			"Dimensie.beschrijving": "Dimensie van geheel",
			"Dimensie.type": "hoogte",
			"Dimensie.waarde": "9",
			"Dimensie.eenheid": "cm"
		}, {
			"@type": "Dimensie",
			"Dimensie.beschrijving": "Dimensie van geheel",
			"Dimensie.type": "breedte",
			"Dimensie.waarde": "23",
			"Dimensie.eenheid": "cm"
		}, {
			"@type": "Dimensie",
			"Dimensie.beschrijving": "Dimensie van geheel",
			"Dimensie.type": "diepte",
			"Dimensie.waarde": "24",
			"Dimensie.eenheid": "cm"
		}],
		"MaterieelDing.isOvergedragenBijVerwerving": {
			"@type": "Verwerving",
			"Verwerving.overdrachtVan": "https://lodi.ilabt.imec.be/coghent/dmg/id/objecten/530026088/2021-02-03T15:48:18.091Z",
			"Verwerving.overgedragenAan": "http://www.wikidata.org/entity/Q1809071",
			"Gebeurtenis.plaats": "",
			"Activiteit.gebruikteTechniek": "oningeschreven gevonden",
			"Gebeurtenis.tijd": {
				"@type": "Periode",
				"Periode.begin": "2017",
				"Periode.einde": "2017"
			}
		},
		"MensgemaaktObject.locatie": {
			"opmerking": "Niet publiek"
		},
		"memberOf": "https://lodi.ilabt.imec.be/coghent/dmg/id/dataset/206d69c469151306d018140d6a5345e6"
	}],
    "tree:relation": [{
        "@type": "tree:LessThanRelation",
        "tree:node": "https://lodi.ilabt.imec.be/coghent/dmg/objecten?generatedAtTime=2021-02-03T15:48:12.309Z",
        "tree:path": "prov:generatedAtTime",
        "tree:value": "2021-02-03T15:48:18.091Z",
        "tree:remainingItems": 161
    }]
}
```
