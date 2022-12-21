const express = require("express"); //includo express

//includo multer per poter leggere i dati dello spazio dal form
const multer = require("multer");
const upload = multer();

//creo l'oggetto router che gestisce le routes
const router = express.Router();

//inludo il controller corrispondente alle routes che definisco qui
const controllerSpazio = require("../controllers/spazio");

//creo le mie routes con la funzione di callback definita nel controller
router.post("/login", upload.none(), controllerSpazio.);
router.post("/signup", upload.none(), controllerSpazio.);
router.get("/byEmail", controllerSpazio.);
router.get("/byID", controllerSpazio.);
router.get("/utente", controllerSpazio.);
router.patch("/utente/:id", upload.none(), controllerSpazio.);
router.delete("/utente/:id", controllerSpazio.);

//esporto le routes per poterle usare nella mia applicazione
module.exports = router;
