const express = require("express"); //includo express

//includo multer per poter leggere i dati dello spazio dal form
const multer = require("multer");
const upload = multer();

//creo l'oggetto router che gestisce le routes
const router = express.Router();

//inludo il controller corrispondente alle routes che definisco qui
const controllerSpazio = require("../controllers/spazio");

//creo le mie routes con la funzione di callback definita nel controller
router.get("/", controllerSpazio.listaSpazi);
router.get("/byID", controllerSpazio.getSpazioConID);
router.get("/disponibilita", controllerSpazio.getDisponibilitaPeriodo);
router.post("/", upload.none(), controllerSpazio.creaSpazio);
router.patch("/:id", upload.none(), controllerSpazio.modificaSpazio);
router.delete("/:id", controllerSpazio.cancellaSpazio);

//esporto le routes per poterle usare nella mia applicazione
module.exports = router;
