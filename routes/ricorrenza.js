const express = require("express")
const tokenChecker = require("../scripts/authentication");

const router = express.Router();

const controllerRicorrenza = require("../controllers/ricorrenza")

router.get("/byID", tokenChecker(1), controllerRicorrenza.getRicorrenzaConID);
router.delete("/:id", tokenChecker(1), controllerRicorrenza.eliminaRicorrenza);
router.patch("/:id", tokenChecker(1), controllerRicorrenza.modificaRicorrenza);
router.get("/byPeriodo", tokenChecker(1), controllerRicorrenza.getRicorrenzePerPeriodo); 
router.get("/", tokenChecker(2), controllerRicorrenza.tutti);  

module.exports = router;