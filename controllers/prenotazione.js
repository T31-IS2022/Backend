const Prenotazione = require("../models/prenotazione")

var ObjectID = require("mongodb").ObjectID;

// get prenotazione by id
const getPrenotazioneConID = (req, res) => {
    console.log(
        "Richiesta prenotazione by ID\n\tQuery: " +
        JSON.stringify(req.query) +
        "\n\tParametri: " +
        JSON.stringify(req.params)
    );

    let id = req.query.id;

    Prenotazione.findOne({ _id: ObjectID(id)}, (err, data) => {
        if(err || !data){
            return res.status(404).json({
                message: "La prenotazione non esiste",
            })
        }
        else return res.status(200).json(data);
    });
}


// get tutte le ricorrenze di una prenotazione
/*const getRicorrenzePrenotazione = (req, res) => {
    console.log(
        "Richieste ricorrenze di una prenotazione\n\tQuery: " +
        JSON.stringify(req.query) +
        "\n\tParametri: " +
        JSON.stringify(req.params)
    );

    const id = req.params.id;


}*/


// crea nuova prenotazione



// modifica prenotazione



// elimina prenotazione

module.exports = {
    getPrenotazioneConID
}


