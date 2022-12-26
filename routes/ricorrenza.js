const express = require("express")

const router = express.Router();

const controllerRicorrenza = require("../controllers/ricorrenza")

router.get("/byID", controllerRicorrenza.getRicorrenzaConID);
router.delete("/eliminaRicorrenza/:id", controllerRicorrenza.eliminaRicorrenza)
router.patch("/modificaRicorrenza/:id", controllerRicorrenza.modificaRicorrenza);
router.get("/getRicorrenzePerPeriodo", controllerRicorrenza.getRicorrenzePerPeriodo);

module.exports = router;