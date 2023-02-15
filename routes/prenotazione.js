const express = require("express");
const tokenChecker = require("../scripts/authentication");

const router = express.Router();

const upload = require("multer")();

const controllerPrenotazione = require("../controllers/prenotazione");

router.get("/", tokenChecker(2), controllerPrenotazione.tutti);
router.get("/byUtente", tokenChecker(1), controllerPrenotazione.getPrenotazioniUtente);
router.get("/byID", tokenChecker(1), controllerPrenotazione.getPrenotazioneConID);
router.get("/ricorrenze", tokenChecker(1), controllerPrenotazione.getRicorrenzePrenotazione);
router.post("/", upload.none(), tokenChecker(1), controllerPrenotazione.nuovaPrenotazione);
router.patch("/:id", tokenChecker(1), controllerPrenotazione.modificaPrenotazione);
router.delete("/:id", tokenChecker(1), controllerPrenotazione.eliminaPrenotazione);

module.exports = router;
