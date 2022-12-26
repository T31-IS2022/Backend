const express = require("express")

const router = express.Router();

const upload = require("multer")();

const controllerPrenotazione = require("../controllers/prenotazione")

router.get("/byID", controllerPrenotazione.getPrenotazioneConID)
router.post("/", upload.none(), controllerPrenotazione.nuovaPrenotazione)
router.delete("/eliminaPrenotazione/:id", controllerPrenotazione.eliminaPrenotazione)
router.get("/getRicorrenzePrenotazione", controllerPrenotazione.getRicorrenzePrenotazione)
router.patch("/modificaPrenotazione", controllerPrenotazione.modificaPrenotazione)
router.get("/getPrenotazioniUtente", controllerPrenotazione.getPrenotazioniUtente)

module.exports = router;