const express = require("express");
let { getEventstream } = require("../controllers/eventstreamController");
let { getDiscoveryMetadata } = require("../controllers/discoveryController");
let { getSubjectPageOfMember } = require("../controllers/subjectPageController");

const router = express.Router();

router.get('/favicon.ico', (req, res) => res.status(404).send("Not found"));

router.get('/', getDiscoveryMetadata)
router.get("/:institution/:adlibDatabase", getEventstream);

router.get('/id/datasetcatalogus/:ref', (req, res) => res.redirect('/'));
router.get('/:institution/id/dataset/:ref', (req, res) => res.redirect('/'))
router.get('/:institution/id/:database/:refBasis/:refVersie', getSubjectPageOfMember);

module.exports = router;
