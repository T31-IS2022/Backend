//importo mongoose
const mongoose = require("mongoose");

const positiveNumber = {
    type: Number,
    //required: true,
    default: 0,
    validate: (prezzo) => {
        return prezzo >= 0;
    },
};

//schema del servizio
const schemaServizio = new mongoose.Schema({
    nome: { type: String, required: true },
    descrizione: { type: String },
    tipologia: String,
    prezzoIniziale: positiveNumber,
    prezzoOra: positiveNumber,
    URLfoto: String,
});

//schema dello spazio
const schemaSpazio = new mongoose.Schema({
    nome: { type: String, required: true },
    descrizione: String,
    tipologia: String,
    prezzoIniziale: positiveNumber,
    prezzoOra: positiveNumber,
    URLfoto: { type: String, default: "path/alla/foto/placeholder.png" },
    servizi: [schemaServizio],
});

//schema della prenotazione
const schemaPrenotazione = new mongoose.Schema({
    inizio: { type: Date, required: true },
    fine: { type: Date, required: true },
    spaziPrenotati: [schemaSpazio],
    serviziPrenotati: [schemaServizio],
});

//converto lo schema in un modello
const Space = mongoose.model("Space", spaceSchema);

//esporto il modello per poterlo usare nei controller
module.exports = Space;
