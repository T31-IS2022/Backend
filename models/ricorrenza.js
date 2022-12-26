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

//schema della ricorrenza
const schemaRicorrenza = new mongoose.Schema({
    inizio: { type: Date, required: true },
    fine: { type: Date, required: true },
    spaziPrenotati: [{type: mongoose.Schema.Types.ObjectId, ref: 'Spazio' }],
    serviziPrenotati: [{type: mongoose.Schema.Types.ObjectId, ref: 'Servizio' }],
});

const Ricorrenza = mongoose.model("Ricorrenza", schemaRicorrenza, "ricorrenze");

module.exports = Ricorrenza;
