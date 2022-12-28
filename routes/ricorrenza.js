const express = require("express")
const {tokenChecker: tokenChecker} = require("../scripts/authentication");

const router = express.Router();

const controllerRicorrenza = require("../controllers/ricorrenza")

router.get("/byID", tokenChecker(1), controllerRicorrenza.getRicorrenzaConID);
router.delete("/eliminaRicorrenza/:id", tokenChecker(1), controllerRicorrenza.eliminaRicorrenza);
router.patch("/modificaRicorrenza/:id", tokenChecker(1), controllerRicorrenza.modificaRicorrenza);
router.get("/getRicorrenzePerPeriodo", tokenChecker(1), controllerRicorrenza.getRicorrenzePerPeriodo);  //potremmo togliere

module.exports = router;