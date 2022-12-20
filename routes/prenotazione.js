const express = require("express")

const router = express.Router();

const controllerPrenotazione = require("../controllers/prenotazione")

router.get("/byID", controllerPrenotazione.getPrenotazioneConID);

module.exports = router;