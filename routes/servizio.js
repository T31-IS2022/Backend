const express = require('express');

const multer = require("multer");
const upload = multer();

const router = express.Router();

const controllerServizio = require("../controllers/servizio");

router.get('/tutti', controllerServizio.listaServizi);
router.get('/id', controllerServizio.getID);
router.get('/disponibilita', controllerServizio.getDisponibilita);
router.post('/', upload.none(), controllerServizio.crea);
router.patch('/:id', upload.none(), controllerServizio.modifica);
router.delete('/:id', controllerServizio.cancella);

module.exports = router;