const express = require("express")
const {tokenChecker: tokenChecker} = require("../scripts/authentication");

const router = express.Router();

const upload = require("multer")();

const controllerPrenotazione = require("../controllers/prenotazione");

router.get("/byID", tokenChecker(1), controllerPrenotazione.getPrenotazioneConID);
router.post("/", upload.none(), tokenChecker(1), controllerPrenotazione.nuovaPrenotazione);
router.delete("/eliminaPrenotazione/:id", tokenChecker(1), controllerPrenotazione.eliminaPrenotazione);
router.get("/getRicorrenzePrenotazione", tokenChecker(1), controllerPrenotazione.getRicorrenzePrenotazione);
router.patch("/modificaPrenotazione", tokenChecker(1), controllerPrenotazione.modificaPrenotazione);
router.get("/getPrenotazioniUtente", tokenChecker(1), controllerPrenotazione.getPrenotazioniUtente);

module.exports = router;