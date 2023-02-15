const express = require("express"); //includo express
const tokenChecker = require("../scripts/authentication");

//includo multer per poter leggere i dati dello spazio dal form
const multer = require("multer");
const upload = multer({ dest: "images/utenti" });

//creo l'oggetto router che gestisce le routes
const router = express.Router();

//inludo il controller corrispondente alle routes che definisco qui
const controllerUtente = require("../controllers/utente");

//creo le mie routes con la funzione di callback definita nel controller
router.get("/", tokenChecker(2), controllerUtente.listaUtenti);
router.post("/login", upload.none(), controllerUtente.loginUtente);
router.post("/registrazione", upload.single("foto"), controllerUtente.registrazione);
router.get("/conferma", controllerUtente.confermaUtente);
router.get("/byEmail", tokenChecker(1), controllerUtente.getUtenteConEmail);
router.get("/byToken", tokenChecker(1), controllerUtente.getUtenteConToken);
router.get("/byID", tokenChecker(2), controllerUtente.getUtenteConID);
router.patch("/:id", tokenChecker(1), upload.single("foto"), controllerUtente.modificaUtente);
router.delete("/:id", tokenChecker(1), controllerUtente.cancellaUtente);

//esporto le routes per poterle usare nella mia applicazione
module.exports = router;
