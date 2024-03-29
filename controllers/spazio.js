//includo il modello dello spazio per poterlo usare qui
const Spazio = require("../models/spazio");
const Ricorrenza = require("../models/ricorrenza"); //serve per trovare la disponibilità dello spazio

//includo l'ObjectId per poter cercare elementi tramite il loro ID
var ObjectId = require("mongodb").ObjectId;

//FUNZIONI PER LE VARIE ROUTES

//restituisce tutti gli spazi
const listaSpazi = (req, res) => {
    console.log("Richiesta una lista di spazi\n\tQuery: " + JSON.stringify(req.query));

    //prelevo il numero di spazi da restituire e da quale di essi iniziare
    let count = req.query.count;
    let start = req.query.start;

    //cerco gli spazi dando un filtro vuoto per ottenerli tutti
    Spazio.find({}, (err, data) => {
        if (err) return res.status(500).json({ code: 500, message: err }); //risposta in caso di errore
        if (!data) return res.status(204).json({ code: 204, message: "Nessuno spazio trovato" });
        return res.status(200).json(data); //restituisco i dati di tutti gli spazi
    })
        .skip(start)
        .limit(count)
        .populate("servizi");
};

//restituisce le info di uno spazio dato l'ID
const getSpazioConID = (req, res) => {
    console.log(
        "Richiesto uno spazio tramite ID\n\tQuery: " +
            JSON.stringify(req.query) +
            "\n\tParametri: " +
            JSON.stringify(req.params)
    );

    //prendo l'ID dello spazio dai parametri della richiesta
    let id = req.query.id;
    //cerco e restituisco lo spazio con quell'ID'
    Spazio.findOne({ _id: ObjectId(id) }, (err, data) => {
        if (err) return res.status(500).json({ code: 500, message: err });
        if (!data) {
            return res.status(404).json({
                code: 404,
                message: "Lo spazio richiesto non esiste",
            });
        } else return res.status(200).json(data); //se trovo l'oggetto lo restituisco
    }).populate("servizi");
};

//restituisce lo status dello spazio nel periodo indicato
const getDisponibilitaPeriodo = (req, res) => {
    console.log(
        "Richiesta la disponibilità di uno spazio\n\tQuery: " +
            JSON.stringify(req.query) +
            "\n\tParametri: " +
            JSON.stringify(req.params)
    );

    //prendo l'ID dello spazio e le date dai parametri della richiesta
    let id = req.query.id;
    let inizio = req.query.inizio;
    let fine = req.query.fine;
    //cerco lo spazio con quell'ID
    Spazio.findOne({ _id: ObjectId(id) }, (err, data) => {
        if (err || !data) {
            return res.status(404).json({ code: 404, message: "Lo spazio richiesto non esiste" });
        } else {
            //prelevo tutte le ricorrenze nel periodo richiesto e vedo se lo spazio compare tra quelli prenotati
            const dataInizio = new Date(inizio);
            const dataFine = new Date(fine);
            Ricorrenza.count({
                inizio: { $lt: dataFine },
                fine: { $gt: dataInizio },
                spaziPrenotati: { $elemMatch: { $eq: ObjectId(id) } },
            })
                .then((numero) => {
                    if (numero == 0) {
                        return res.status(200).json({
                            code: 200,
                            disponibilita: true,
                            message: `Lo spazio ${id} è diponibile nel periodo tra ${inizio} e ${fine}`,
                        });
                    } else {
                        return res.status(200).json({
                            code: 200,
                            disponibilita: false,
                            message: `Lo spazio ${id} NON è diponibile nel periodo tra ${inizio} e ${fine}`,
                        });
                    }
                })
                .catch((err) => {
                    return res.status(500).json({ code: 500, message: err });
                });
        }
    });
};

//creazione di un nuovo spazio
const creaSpazio = (req, res) => {
    //stampo le info sulla richiesta
    console.log("Nuovo spazio\n\tParametri: " + JSON.stringify(req.body));

    //controllo se uno spazio con questo nome è già stato inserito nel database
    Spazio.findOne({ nome: req.body.nome }, (err, data) => {
        if (err) return res.status(500).json({ code: 500, message: err });
        if (!data) {
            //se non l'ho inserito creo un nuovo spazio con i dati provenienti dalla richiesta
            const nuovoSpazio = new Spazio({
                nome: req.body.nome,
                descrizione: req.body.descrizione,
                tipologia: req.body.tipologia,
                prezzoIniziale: req.body.prezzoIniziale,
                prezzoOra: req.body.prezzoOra,
                URLfoto: req.body.URLfoto,
                servizi: JSON.parse(req.body.servizi),
            });

            console.log(nuovoSpazio);

            //salvo il nuovo spazio nel database
            nuovoSpazio.save((err, data) => {
                if (err) {
                    return res.status(500).json({ code: 500, messaggo: err }); //risposta in caso di errore
                } else {
                    return res.status(201).json({ code: 201, message: data }); //risposta se lo spazio è stato salvato nel database
                }
            });
        } else {
            //altrimenti rispondo dicendo che lo spazio è già stato inserito
            return res.status(403).json({
                code: 403,
                message: "E' già presente uno spazio con questo nome",
            });
        }
    });
};

//modifica le informazioni di uno spazio dato l'ID
const modificaSpazio = (req, res) => {
    console.log("Modifica di uno spazio\n\tParametri: " + JSON.stringify(req.params));

    //prendo l'ID dello spazio dai parametri della richiesta
    let id = req.params.id;

    //cerco e modifico lo spazio con quell'ID
    Spazio.findOne({ _id: ObjectId(id) }, (err, data) => {
        if (err) return res.status(500).json({ code: 500, message: err });
        if (!data) {
            return res.status(404).json({ message: "Lo spazio richiesto non esiste" });
        } else {
            //modifiche allo spazio
            data.nome = req.body.nome;
            data.descrizione = req.body.descrizione;
            data.tipologia = req.body.tipologia;
            data.prezzoIniziale = req.body.prezzoIniziale;
            data.prezzoOra = req.body.prezzoOra;
            data.URLfoto = req.body.URLfoto;
            data.servizi = JSON.parse(req.body.servizi);

            //salvo le modifiche
            data.save((err, data) => {
                if (err) return res.status(500).json({ code: 500, message: err }); //risposta in caso di errore
                return res.status(200).json(data); //risposta se lo spazio è stato salvato nel database
            });
        }
    });
};

//elimina uno spazio dato l'ID
const cancellaSpazio = (req, res) => {
    console.log("Eliminazione di uno spazio\n\tParametri: " + JSON.stringify(req.params));

    //prendo l'ID dello spazio dai parametri della richiesta
    let id = req.params.id;

    //prima di eliminarlo verifico che lo spazio esista
    Spazio.findOne({ _id: ObjectId(id) }, (err, data) => {
        if (err) return res.status(500).json({ code: 500, message: err });

        if (!data) {
            return res.status(404).json({ code: 404, message: "Lo spazio richiesto non esiste" });
        } else {
            //cerco ed elimino lo spazio con quell'ID
            Spazio.findOneAndDelete({ _id: ObjectId(id) }, (err) => {
                if (err) return res.status(500).json({ code: 500, message: err });

                return res.status(200).json({
                    code: 200,
                    message: "Spazio eliminato correttamente",
                });
            });
        }
    });
};

//esporto le funzioni per poterle chiamare dalle route
module.exports = {
    listaSpazi,
    getSpazioConID,
    getDisponibilitaPeriodo,
    creaSpazio,
    modificaSpazio,
    cancellaSpazio,
};
