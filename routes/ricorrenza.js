const express = require("express");
const tokenChecker = require("../scripts/authentication");

const router = express.Router();

const controllerRicorrenza = require("../controllers/ricorrenza");

router.get("/", tokenChecker(2), controllerRicorrenza.tutti);
router.get("/byID", tokenChecker(1), controllerRicorrenza.getRicorrenzaConID);
router.get("/byPeriodo", tokenChecker(1), controllerRicorrenza.getRicorrenzePerPeriodo);
router.patch("/:id", tokenChecker(1), controllerRicorrenza.modificaRicorrenza);
router.delete("/:id", tokenChecker(1), controllerRicorrenza.eliminaRicorrenza);

module.exports = router;
