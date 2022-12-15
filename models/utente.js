const mongoose = require("mongoose");

const schemaUtente = new mongoose.Schema({
    nome: { type: String, required: true },
    cognome: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    accountConfermato: { type: Boolean, default: false },
    metodoPagamento: { type: schemaMetodoPagamento, default: null },
    telefono: String,
    indirizzo: String,
    URLfoto: { type: String, default: "/images/utenti/default.png" },
});

const Utente = mongoose.model("Utente", schemaUtente);

module.exports = Utente;
