//importo mongoose
const mongoose = require("mongoose");

//schema della ricorrenza
const schemaRicorrenza = new mongoose.Schema({
    inizio: { type: Date, required: true },
    fine: { type: Date, required: true },
    spaziPrenotati: [{ type: mongoose.Schema.Types.ObjectId, ref: "Spazio" }],
    serviziPrenotati: [{ type: mongoose.Schema.Types.ObjectId, ref: "Servizio" }],
});

const Ricorrenza = mongoose.model("Ricorrenza", schemaRicorrenza, "ricorrenze");

module.exports = Ricorrenza;
