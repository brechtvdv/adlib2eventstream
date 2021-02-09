module.exports = {
    mapInstelling: (institutionURI, input, mappedObject) => {
        mappedObject["MaterieelDing.beheerder"] = institutionURI;
    },

    mapCollectie: (input, mappedObject) => {
        if (input["collection"] && input["collection"][0]) {
            mappedObject["MensgemaaktObject.maaktDeelUitVan"] = []
            for (let c in input["collection"]) {
                mappedObject["MensgemaaktObject.maaktDeelUitVan"].push({
                    "@type": "Collectie",
                    "Entiteit.beschrijving": input["collection"][c]
                })
            }
        }

        // 	"input.source": ["collect>intern"],

    },

    mapObjectnummer: (input, mappedObject) => {
        if (input["object_number"]) mappedObject["Object.identificator"] = {
            "@type": "Identificator",
            "Identificator.identificator": input["object_number"]
        }
    },

    mapObjectnaam: (versionURI, input, mappedObject) => {
        let c = [];
        for(let o in input.Object_name) {
            c.push({
                "@type": "Classificatie",
                "Classificatie.getypeerdeEntiteit": versionURI,
                "Classificatie.toegekendType": {
                    "label": input.Object_name[o].object_name[0]
                }
            });
        }
        if (mappedObject["Entiteit.classificatie"]) mappedObject["Entiteit.classificatie"] = mappedObject["Entiteit.classificatie"].concat(c);
        else mappedObject["Entiteit.classificatie"] = c;
    },

    mapObjectCategorie: (versionURI, input, mappedObject) => {
        // 	"object_category": ["decoratief object"],
        if (input["object_category"] && input["object_category"][0]) {
            let c = [];
            for (let c in input["object_category"]) {
                let categoryName = input["object_category"][c];
                c.push({
                    "@type": "Classificatie",
                    "Classificatie.getypeerdeEntiteit": versionURI,
                    "Classificatie.toegekendType": {
                        "label": categoryName
                    }
                });
            }
            if (mappedObject["Entiteit.classificatie"]) mappedObject["Entiteit.classificatie"] = mappedObject["Entiteit.classificatie"].concat(c);
            else mappedObject["Entiteit.classificatie"] = c;
        }
    },

    mapTitel: (input, mappedObject) => {
        if (input.Title && input.Title[0].title) mappedObject["MensgemaaktObject.titel"] = {
            "@value": input.Title[0].title[0],
            "@language": "nl"
        };
    },

    mapBeschrijving: (input, mappedObject) => {
        if (input.Description && input.Description[0].description) mappedObject["Entiteit.beschrijving"] = {
            "@value": input.Description[0].description[0],
            "@language": "nl"
        };
    },

    mapOplage: (input, mappedObject) => {

    },

    mapConditie: (input, mappedObject) => {
        if(input.Condition && input.Condition[0]) mappedObject["MaterieelDing.conditiebeoordeling"] = processCondition(mappedObject["dcterms:isVersionOf"], input.Condition[0]);
    },

    mapStandplaatsDMG: (input, mappedObject) => {
        if (input.Current_location && input.Current_location[0] && input.Current_location[0]["current_location.context"] && input.Current_location[0]["current_location.context"][0]) {
            const locationContext = input.Current_location[0]["current_location.context"][0];
            if (locationContext.startsWith('DMG_A') || locationContext.startsWith('DMG_B') || locationContext.startsWith('DMG_C')) {
                mappedObject["MensgemaaktObject.locatie"] = {
                    "@id": "https://www.wikidata.org/wiki/Q1809071",
                    "label": "Design Museum Gent"
                }
            } else if (locationContext.startsWith('BELvue')) {
                mappedObject["MensgemaaktObject.locatie"] = {
                    "@id": "https://www.wikidata.org/wiki/Q728437",
                    "opmerking": "bruikleen: BELvue museum"
                }
            } else if (locationContext.startsWith('Hotel')) {
                mappedObject["MensgemaaktObject.locatie"] = {
                    "@id": "https://www.wikidata.org/wiki/Q2120186",
                    "opmerking": "bruikleen: objecten opgesteld in Hotel d'Hane Steenhuysen"
                }
            } else if (locationContext.startsWith('Museum voor Schone Kunsten')) {
                mappedObject["MensgemaaktObject.locatie"] = {
                    "@id": "https://www.wikidata.org/wiki/Q2365880",
                    "opmerking": "bruikleen: Museum voor Schone Kunsten (MSK)"
                }
            } else if (locationContext.startsWith('Sint-Pietersabdij')) {
                mappedObject["MensgemaaktObject.locatie"] = {
                    "@id": "https://www.wikidata.org/wiki/Q1170767",
                    "opmerking": "bruikleen: Sint-Pietersabdij"
                }
            } else if (locationContext.startsWith('Koninklijke Bibliotheek van België')) {
                mappedObject["MensgemaaktObject.locatie"] = {
                    "@id": "https://www.wikidata.org/wiki/Q383931",
                    "opmerking": "bruikleen: KBR"
                }
            } else if (locationContext.startsWith('M-Museum')) {
                mappedObject["MensgemaaktObject.locatie"] = {
                    "@id": "https://www.wikidata.org/wiki/Q2362660",
                    "opmerking": "bruikleen: M-leuven"
                }
            } else if (locationContext.startsWith('MAS')) {
                mappedObject["MensgemaaktObject.locatie"] = {
                    "@id": "https://www.wikidata.org/wiki/Q1646305",
                    "opmerking": "bruikleen: MAS"
                }
            } else if (locationContext.startsWith('STAM')) {
                mappedObject["MensgemaaktObject.locatie"] = {
                    "@id": "https://www.wikidata.org/wiki/Q980285",
                    "opmerking": "bruikleen: STAM"
                }
            } else if (locationContext.startsWith('Industriemuseum')) {
                mappedObject["MensgemaaktObject.locatie"] = {
                    "@id": "https://www.wikidata.org/wiki/Q2245203",
                    "opmerking": "bruikleen: Industriemuseum"
                }
            } else if (locationContext.startsWith('Verbeke')) {
                mappedObject["MensgemaaktObject.locatie"] = {
                    "@id": "https://www.wikidata.org/wiki/Q1888920",
                    "opmerking": "bruikleen: Verbeke Foundation"
                }
            } else if (locationContext.startsWith('Koninklijk Museum voor Schone Kunsten Antwerpen')) {
                mappedObject["MensgemaaktObject.locatie"] = {
                    "@id": "https://www.wikidata.org/wiki/Q1471477",
                    "opmerking": "bruikleen: KMSKA"
                }
            } else if (locationContext.startsWith('Nederlands Zilvermuseum Schoonhoven')) {
                mappedObject["MensgemaaktObject.locatie"] = {
                    "@id": "https://www.wikidata.org/wiki/Q2246858",
                    "opmerking": "bruikleen: Nederlands Zilvermuseum Schoonhoven"
                }
            } else {
                mappedObject["MensgemaaktObject.locatie"] = {
                    "opmerking": "depot"
                }
            }
        }
    },

    mapVervaardiging: (id, input, mappedObject) => {
        // Production and Production_date are equal?
        let productions = [];
        if(input.Production && input.Production[0]) {
            if (input["production.date.notes"]) {
                for (let n in input["production.date.notes"]) {
                    let note = input["production.date.notes"][n];
                    const ontwerpRegex = new RegExp('ontwerp.*');
                    if (ontwerpRegex.test(note)) {
                        // Een ontwerp is de creatie van het concept
                        // Entiteit -> wordtNaarVerwezenDoor ConceptueelDing -> Creatie
                        let c = {
                            "@type": "Creatie",
                            "Gebeurtenis.tijd": {}
                        };

                        let ontwerp_date = input.Production_date[n];
                        if (ontwerp_date['production.date.start']) c["Gebeurtenis.tijd"]["Periode.begin"] = ontwerp_date['production.date.start'][0];
                        if (ontwerp_date['production.date.end']) c["Gebeurtenis.tijd"]["Periode.einde"] = ontwerp_date['production.date.end'][0];

                        for (let p in input["Production"]) {
                            let pro = input["Production"][p];
                            if (pro['creator.role'] && pro['creator.role'][0] === "ontwerper") {
                                c["Activiteit.uitgevoerdDoor"] = {
                                    "@type": "Persoon",
                                    "volledigeNaam": pro["creator"][0]
                                }
                                if (pro['production.place']) c["Gebeurtenis.plaats"] = pro['production.place'][0];
                            }
                        }

                        mappedObject["Entiteit.wordtNaarVerwezenDoor"] = {
                            "@type": "ConceptueelDing",
                            "ConceptueelDing.heeftCreatie": c
                        };
                        productions.push(c);
                    }
                }
            }
            for (let n in input["Production"]) {
                let pro = input["Production"][n];

                let p = {
                    "@type": "Productie",
                    "Productie.product": id
                };
                // Datering van tot
                if (input.Production_date && input.Production_date[n]) {
                    p["Gebeurtenis.tijd"] = {
                        "@type": "Periode"
                    };
                    let prod_date = input.Production_date[n];
                    if (prod_date['production.date.start']) p["Gebeurtenis.tijd"]["Periode.begin"] = prod_date['production.date.start'][0];
                    if (prod_date['production.date.end']) p["Gebeurtenis.tijd"]["Periode.einde"] = prod_date['production.date.end'][0];
                }

                p["Activiteit.uitgevoerdDoor"] = {
                    "@type": "Persoon",
                    "volledigeNaam": pro["creator"][0]
                };
                if (pro['production.place'] && pro['production.place'][0] != "") p["Gebeurtenis.plaats"] = pro['production.place'][0];
                productions.push(p);
            }
            if (mappedObject["MaterieelDing.productie"]) mappedObject["MaterieelDing.productie"] = mappedObject["MaterieelDing.productie"].concat(productions);
            else mappedObject["MaterieelDing.productie"] = productions;
        }
    },

    mapFysiekeKenmerken: (input, mappedObject) => {
        // Materialen
        if(input.Material && input.Material[0]) {
            mappedObject["MensgemaaktObject.materiaal"] = [];
            for(let mat in input.Material) {
                for(let part in input.Material[mat]["material.part"]) {
                    const onderdeel = input.Material[mat]["material.part"][part];
                    for (let m in input.Material[mat]["material"]) {
                        const mate = input.Material[mat]["material"][m];
                        mappedObject["MensgemaaktObject.materiaal"].push({
                            "label": onderdeel + ": " + mate
                        })
                    }
                }
            }
        }

        // technieken

        // afmetingen
        if(input.Dimension && input.Dimension[0]) {
            mappedObject["MensgemaaktObject.dimensie"] = [];
            for(let d in input.Dimension) {
                let onderdeel = input.Dimension[d]["dimension.part"] ? input.Dimension[d]["dimension.part"][0] : "geheel";
                let afmeting = input.Dimension[d]["dimension.type"] ? input.Dimension[d]["dimension.type"][0] : "";
                let waarde = input.Dimension[d]["dimension.value"] ? input.Dimension[d]["dimension.value"][0] : "unknown";
                let eenheid = input.Dimension[d]["dimension.unit"] ? input.Dimension[d]["dimension.unit"][0] : "cm";

                mappedObject["MensgemaaktObject.dimensie"].push({
                    "@type": "Dimensie",
                    "Dimensie.beschrijving": "Dimensie van " + onderdeel,
                    "Dimensie.type": afmeting,
                    "Dimensie.waarde": waarde,
                    "Dimensie.eenheid": eenheid
                });
            }
        }
    },

    mapVerwervingDMG: (versionURI, institutionURI, input, mappedObject) => {
        let datum = input["acquisition.date"] ? input["acquisition.date"][0] : "";
        let methode = input["acquisition.method"] ? input["acquisition.method"][0] : "";
        let plaats = input["acquisition.place"] ? input["acquisition.place"][0] : "";

        mappedObject["MaterieelDing.isOvergedragenBijVerwerving"] = {
            "@type": "Verwerving",
            "Verwerving.overdrachtVan": versionURI,
            "Verwerving.overgedragenAan": institutionURI,
            "Gebeurtenis.plaats": plaats,
            "Activiteit.gebruikteTechniek": methode,
            "Gebeurtenis.tijd": {
                "@type": "Periode",
                "Periode.begin": datum,
                "Periode.einde": datum
            }
        }
    },

    mapVerwervingStam: (versionURI, institutionURI, input, mappedObject) => {
        let datum = input["acquisition.date"] ? input["acquisition.date"][0] : "";
        let methode = input["acquisition.method"] ? input["acquisition.method"][0] : "";

        mappedObject["MaterieelDing.isOvergedragenBijVerwerving"] = {
            "@type": "Verwerving",
            "Verwerving.overdrachtVan": versionURI,
            "Verwerving.overgedragenAan": institutionURI,
            "Activiteit.gebruikteTechniek": methode,
            "Gebeurtenis.tijd": {
                "@type": "Periode",
                "Periode.begin": datum,
                "Periode.einde": datum
            }
        }
    },

    mapTentoonstelling: (objectUri, input, mappedObject) => {
        if (input["Exhibition"]) {
            mappedObject["Entiteit.maaktDeelUitVan"] = [];
            for (let e in input["Exhibition"]) {
                let exhibition = input["Exhibition"][e];
                let beschrijving = exhibition["exhibition"] && exhibition["exhibition"][0] ? exhibition["exhibition"][0] : "";
                let periode_begin = exhibition["exhibition.date.start"] && exhibition["exhibition.date.start"][0] ? exhibition["exhibition.date.start"][0] : "";
                let periode_einde = exhibition["exhibition.date.end"] && exhibition["exhibition.date.end"][0] ? exhibition["exhibition.date.end"][0] : "";
                let plaats = exhibition["exhibition.venue.place"] && exhibition["exhibition.venue.place"][0] ? exhibition["exhibition.venue.place"][0] : "";

                let ex = {
                    "@type": "Collectie",
                    "gebruiktBijActiviteit": {
                        "@type": "Activiteit",
                        "Entiteit.type": "http://vocab.getty.edu/aat/300054766", // Tentoonstelling,
                        "Entiteit.beschrijving": beschrijving,
                        "Gebeurtenis.tijd": {
                            "@type": "Periode",
                            "Periode.begin": periode_begin,
                            "Periode.einde": periode_einde
                        },
                        "Gebeurtenis.plaats": plaats
                    }
                }
                mappedObject["Entiteit.maaktDeelUitVan"].push(ex);
            }
        }
    },

    mapAssociaties: (versionURI, input, mappedObject) => {
        let c = [];

        // Geass. Persoon / instelling
        if (input["Associated_person"] && input["Associated_person"][0]) {
            for (let p in input["Associated_person"]) {
                let person = input["Associated_person"][p];

                c.push({
                    "@type": "Classificatie",
                    "Classificatie.getypeerdeEntiteit": versionURI,
                    "Classificatie.toegekendType": {
                        "label": person
                    }
                });
            }
        }
        // Geass. Onderwerp
        if (input["Associated_subject"] && input["Associated_subject"][0]) {
            for (let p in input["Associated_subject"]) {
                let subject = input["Associated_subject"][p]["association.subject"][0];

                c.push({
                    "@type": "Classificatie",
                    "Classificatie.getypeerdeEntiteit": versionURI,
                    "Classificatie.toegekendType": {
                        "label": subject
                    }
                });
            }
        }
        // Geass. Periode
        if (input["Associated_period"] && input["Associated_period"][0]) {
            for (let p in input["Associated_period"]) {
                let period = input["Associated_period"][p]["association.period"][0];

                c.push({
                    "@type": "Classificatie",
                    "Classificatie.getypeerdeEntiteit": versionURI,
                    "Classificatie.toegekendType": {
                        "label": period
                    }
                });
            }
        }
        if (mappedObject["Entiteit.classificatie"]) mappedObject["Entiteit.classificatie"] = mappedObject["Entiteit.classificatie"].concat(c);
        else mappedObject["Entiteit.classificatie"] = c;
    },

    mapIconografie: (input, mappedObject) => {
        // Content_person en Content_subject
        if (input["Content_subject"] && input["Content_subject"][0]) {
            for (let s in input["Content_subject"]) {
                if (input["Content_subject"][s]["content.subject"]) {
                    let subject = input["Content_subject"][s]["content.subject"][0];
                    mappedObject["Entiteit.beeldtUit"] = {
                        label: subject
                    };
                }
            }
        }

        if (input["Content_person"] && input["Content_person"][0]) {
            for (let p in input["Content_person"]) {
                if (input["Content_person"][p]["content.person.name"]) {
                    let person = input["Content_subject"][p]["content.person.name"][0];
                    mappedObject["Entiteit.beeldtUit"] = {
                        label: person
                    };
                }
            }
        }
    }
}


// Draft
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
