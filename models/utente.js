//importo mongoose
const mongoose = require("mongoose");

const schemaMetodoPagamento = new mongoose.Schema({
    nome: String,
    circuito: String,
    IBAN: String,
    scadenza: Date,
    CVV: String,
});

const schemaUtente = new mongoose.Schema({
    nome: { type: String, required: true },
    cognome: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    confermaAccount: { type: Boolean, default: false },
    metodoPagamento: {schemaMetodoPagamento},
    telefono: String,
    indirizzo: String,
    URLfoto: { type: String, default: "images/utenti/default.png" },
});

const Utente = mongoose.model("Utente", schemaUtente, "utenti");

module.exports = Utente;
