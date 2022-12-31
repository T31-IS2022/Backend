const express = require("express");
const { tokenChecker: tokenChecker } = require("../scripts/authentication");

const multer = require("multer");
const upload = multer();

const router = express.Router();

const controllerServizio = require("../controllers/servizio");

router.get("/", controllerServizio.listaServizi);
router.get("/byID", controllerServizio.getID);
router.get("/disponibilita", controllerServizio.getDisponibilita);
router.post("/", upload.none(), tokenChecker(2), controllerServizio.crea);
router.patch(
    "/:id",
    upload.none(),
    tokenChecker(2),
    controllerServizio.modifica
);
router.delete("/:id", tokenChecker(2), controllerServizio.cancella);

module.exports = router;
