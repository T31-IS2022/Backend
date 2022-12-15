const express = require("express"); //includo express

//includo multer per poter leggere i dati dello spazio dal form
const multer = require("multer");
const upload = multer();

//creo l'oggetto router che gestisce le routes
const router = express.Router();

//inludo il controller corrispondente alle routes che definisco qui
const controllerUtente = require("../controllers/utente");

//creo le mie routes con la funzione di callback definita nel controller
router.post("/login", upload.none(), controllerUtente.loginUtente);
router.post("/signup", upload.none(), controllerUtente.registrazione);
router.get("/byEmail", controllerUtente.getUtenteConEmail);
router.get("/byID", controllerUtente.getUtenteConID);
router.get("/utente", controllerUtente.listaUtenti);
router.patch("/utente/:id", upload.none(), controllerUtente.modificaUtente);
router.delete("/utente/:id", controllerUtente.cancellaUtente);

//esporto le routes per poterle usare nella mia applicazione
module.exports = router;
