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

const schemaPrenotazione = new mongoose.Schema({
    proprietario: {type: mongoose.Schema.Types.ObjectId, ref: 'Utente' },
    statusPagamento: Number,
    importoPagamento: positiveNumber,
    ricorrenze: [{type: mongoose.Schema.Types.ObjectId, ref: 'Ricorrenza' }],
    eventoCollegato: {type: mongoose.Schema.Types.ObjectId, ref: 'Evento' },
});

//converto lo schema in un modello
const Prenotazione = mongoose.model("Prenotazione", schemaPrenotazione, "prenotazioni");

//esporto il modello per poterlo usare nei controller
module.exports = Prenotazione;
