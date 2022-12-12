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

const schemaEvento = new mongoose.Schema({
    titolo: { type: String, required: true },
    sottotitolo: { type: String },
    descrizione: { type: String },
    organizzatore: { type: String, required: true },
    URLbanner: { type: String },
    confermato: Boolean,
});

//schema della prenotazione
const schemaRicorrenza = new mongoose.Schema({
    inizio: { type: Date, required: true },
    fine: { type: Date, required: true },
    spaziPrenotati: [schemaSpazio],
    serviziPrenotati: [schemaServizio],
});

const schemaPrenotazione = new mongoose.Schema({
    proprietario: schemaUtente,
    pagamento: schemaPagamento,
    ricorrenze: [schemaRicorrenza],
    eventoCollegato: schemaEvento,
});

const schemaUtente = new mongoose.Schema({
    nome: { type: String, required: true },
    cognome: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    confermaAccount: { type: Boolean, default: false },
    metodoPagamento: schemaMetodoPagamento,
    telefono: String,
    indirizzo: String,
    URLfoto: { type: String, default: "path/alla/foto/placeholder.png" },
});

const schemaMetodoPagamento = new mongoose.Schema({
    nome: String,
    circuito: String,
    IBAN: String,
    scadenza: Date,
    CVV: String,
});

//converto lo schema in un modello
const Servizio = mongoose.model("Servizio", schemaServizio);
const Spazio = mongoose.model("Spazio", schemaSpazio);
const Evento = mongoose.model("Evento", schemaEvento);
const Ricorrenza = mongoose.model("Ricorrenza", schemaRicorrenza);
const Prenotazione = mongoose.model("Prenotazione", schemaPrenotazione);
const Pagamento = mongoose.model("Pagamento", schemaPagamento);
const Utente = mongoose.model("Utente", schemaUtente);
const metodoPagamento = mongoose.model(
    "MetodoPagamento",
    schemaMetodoPagamento
);

//esporto il modello per poterlo usare nei controller
module.exports = Space;
