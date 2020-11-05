const express = require("express");
import { getEventstream } from "../controllers/eventstreamController";
import {getDiscoveryMetadata} from "../controllers/discoveryController";

const router = express.Router();

router.get('/favicon.ico', (req, res) => res.status(404).send("Not found"));

router.get('/', getDiscoveryMetadata)
router.get("/:adlibDatabase", getEventstream);

module.exports = router;
