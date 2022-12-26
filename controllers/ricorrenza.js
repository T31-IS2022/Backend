const Ricorrenza = require("../models/ricorrenza")

var ObjectID = require("mongodb").ObjectId;

// get ricorrenza con id
const getRicorrenzaConID = (req, res) => {
    console.log(
        "Richiesta ricorrenza con ID\n\tQuery: " +
        JSON.stringify(req.query) +
        "\n\tParametri: " +
        JSON.stringify(req.params)
    );

    // parametro nell'url ?id= . . .
    let id = req.query.id;

    Ricorrenza.findOne({ _id: ObjectID(id)})
              .populate('spaziPrenotati')
              .populate('serviziPrenotati')
              .exec((err, data) => {
                if(err || !data){
                    return res.status(404).json({
                        message: "La ricorrenza non esiste",
                    });
                }
                else return res.status(200).json(data);
              });
}

// elimina ricorrenza
const eliminaRicorrenza = (req, res) => {
    console.log(
        "Elimina ricorrenza\n\tParametri: " + JSON.stringify(req.params)
    );

    // htpps://...route.../:id
    let id = req.params.id;

    Ricorrenza.findOneAndDelete({_id: ObjectID(id)}, (err, data) => {
        if(err){
            return res.status(404).json({
                message: "La ricorrenza non esiste",
            });
        }
        else{
            return res.status(200).json(data);
        }
    });
}

// modifica ricorrenza
const modificaRicorrenza = (req, res) => {
    console.log(
        "Modifica di una ricorrenza\n\tParams: " + JSON.stringify(req.params)
    );

    let id = req.params.id;

    Ricorrenza.findOne({ _id: ObjectID(id) }, (err, data) =>{
        if(err || !data){
            return res.status(404).json({ message: "La ricorrenza non esiste"});
        }
        else{
            /*
                Esempio formato del body (date ottenute con new Date().toISOString() )
                - formato raw json

                {
                    "inizio": "2022-12-25T20:20:20.090Z",
                    "fine":"2022-12-25T22:22:22.090Z",
                    "spaziPrenotati":["63a3277a9c88f0007ca92e04", "63a3277a9c88f0007ca92e04", "63a3277a9c88f0007ca92e04"],
                    "serviziPrenotati":["63a3a0d4898364bac0118185", "63a3a0d4898364bac0118185", "63a3a0d4898364bac0118185"]
                }
            */
            data.inizo = req.body.inizio;
            data.fine = req.body.fine;
            data.spaziPrenotati = req.body.spaziPrenotati;
            data.serviziPrenotati = req.body.serviziPrenotati;

            data.save((err, data) => {
                if (err){
                    return res.status(500).json({ errore: err })
                }
                else return res.status(200).json(data);
                
            });
        }
    });
}

// ottieni ricorrenze in un intervallo di tempo
const getRicorrenzePerPeriodo = (req, res) => {
    console.log(
        "Richieste ricorrenze in intervallo di tempo\n\tQuery: " +
        JSON.stringify(req.query) +
        "\n\tParametri: " +
        JSON.stringify(req.params)
    );

    if(req.query.inizio > req.query.fine){
        return res.status(400).json({
            errore: "data di inizio maggiore di data di fine"
        });
    }
    
    // cerco tutte le ricorrenze che sono "sovrapposte" anche parzialmente
    // all'intervallo di tempo specificato in req.query (ad esempio se viene passato l'intervallo 
    // da 12:00 a 16:00, viene ritornata anche la ricorrenza che va da 11:00 a 13:00 perchè è nell'intervallo specificato)
    let query = {
        inizio: { $lt: req.query.fine },
        fine: { $gte: req.query.inizio }
    }

    Ricorrenza.find(query)
                .populate('spaziPrenotati')
                .populate('serviziPrenotati')
                .exec((err, data) => {
                    if(err){
                        return res.status(500).json({ errore: err})
                    }
                    else return res.status(200).json(data);
                });

    
}

module.exports = {
    getRicorrenzePerPeriodo,
    modificaRicorrenza,
    eliminaRicorrenza,
    getRicorrenzaConID
}