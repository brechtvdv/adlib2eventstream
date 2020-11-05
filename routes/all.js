const express = require("express");
let { getEventstream } = require("../controllers/eventstreamController");
let { getDiscoveryMetadata } = require("../controllers/discoveryController");

const router = express.Router();

router.get('/favicon.ico', (req, res) => res.status(404).send("Not found"));

router.get('/', getDiscoveryMetadata)
router.get("/:adlibDatabase", getEventstream);

module.exports = router;
