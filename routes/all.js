const express = require("express");
import { getEventstream } from "../controllers/eventstreamController";

const router = express.Router();

router.get('/favicon.ico', (req, res) => res.status(404).send("Not found"));

router.get("/:adlibDatabase", getEventstream);

module.exports = router;
