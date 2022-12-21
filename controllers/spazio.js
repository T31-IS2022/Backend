//includo il modello dello spazio per poterlo usare qui
const Spazio = require("../models/spazio");

//includo l'ObjectId per poter cercare elementi tramite il loro ID
var ObjectId = require("mongodb").ObjectID;

//FUNZIONI PER LE VARIE ROUTES

//restituisce tutti gli utenti
const listaSpazi = (req, res) => {
    console.log(
        "Richiesta una lista di spazi\n\tQuery: " + JSON.stringify(req.query)
    );

    //prelevo il numero di spazi da restituire e da quale di essi iniziare
    let count = req.query.count;
    let start = req.query.start;

    //cerco gli spazi dando un filtro vuoto per ottenerli tutti
    Spazio.find({}, (err, data) => {
        if (err) {
            return res.json({ Errore: err }); //risposta in caso di errore
        }
        return res.status(200).json(data); //restituisco i dati di tutti gli spazi
    })
        .skip(start)
        .limit(count);
};

//creazione di un nuovo spazio
const creaSpazio = (req, res) => {
    //stampo le info sulla richiesta
    console.log("Nuovo spazio\n\tParametri: " + JSON.stringify(req.body));

    //controllo se uno spazio con questo nome è già stato inserito nel database
    Spazio.findOne({ nome: req.body.nome }, (err, data) => {
        if (!data) {
            //se non l'ho inserito creo un nuovo spazio con i dati provenienti dalla richiesta
            const nuovoSpazio = new Utente({
                nome: req.body.nome,
                descrizione: req.body.descrizione,
                tipologia: req.body.tipologia,
                prezzoIniziale: req.body.prezzoIniziale,
                prezzoOra: req.body.prezzoOra,
                URLfoto: req.body.URLfoto,
                //TODO aggiungere lista servizi
            });

            console.log(nuovoSpazio);

            //salvo il nuovo spazio nel database
            nuovoSpazio.save((err, data) => {
                if (err) {
                    return res.json({ Errore: err }); //risposta in caso di errore
                } else {
                    return res.status(201).json(data); //risposta se lo spazio è stato salvato nel database
                }
            });
        } else {
            //se non è stato inserito controllo se c'è un errore
            if (err) {
                return res.json(
                    "Errore nella creazione dello spazio. Errore: " + err
                );
            } else {
                //altrimenti rispondo dicendo che lo spazio è già stato inserito
                return res.status(403).json({
                    message: "E' già presente uno spazio con questo nome",
                });
            }
        }
    });
};

//restituisce le info di uno utente data l'email
const getUtenteConEmail = (req, res) => {
    console.log(
        "Richiesto un utente tramite email\n\tQuery: " +
            JSON.stringify(req.query) +
            "\n\tParametri: " +
            JSON.stringify(req.params)
    );

    //prendo l'email dell'utente dai parametri della richiesta
    let email = req.query.email;
    //cerco e restituisco l'utente con quella email
    Utente.findOne({ email: email }, (err, data) => {
        if (err || !data) {
            return res
                .status(404)
                .json({ message: "L'utente richiesto non esiste" });
        } else return res.json(data); //se trovo l'oggetto lo restituisco
    });
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
    let id = req.query.ID;
    //cerco e restituisco lo spazio con quell'ID'
    Spazio.findOne({ _id: ObjectId(id) }, (err, data) => {
        if (err || !data) {
            return res.status(404).json({
                message: "Lo spazio richiesto non esiste",
            });
        } else return res.status(200).json(data); //se trovo l'oggetto lo restituisco
    });
};

//modifica le informazioni di uno spazio dato l'ID
const modificaSpazio = (req, res) => {
    console.log(
        "Modifica di uno spazio\n\tParametri: " + JSON.stringify(req.params)
    );

    //prendo l'ID dello spazio dai parametri della richiesta
    let id = req.params.id;

    //cerco e modifico lo spazio con quella email
    Spazio.findOne({ _id: ObjectId(id) }, (err, data) => {
        if (err || !data) {
            return res
                .status(404)
                .json({ message: "Lo spazio richiesto non esiste" });
        } else {
            //modifiche allo spazio
            data.nome = req.body.nome;
            data.descrizione = req.body.descrizione;
            data.tipologia = req.body.tipologia;
            data.prezzoIniziale = req.body.prezzoIniziale;
            data.prezzoOra = req.body.prezzoOra;
            data.URLfoto = req.body.URLfoto;
            //TODO aggiungere lista servizi

            //salvo le modifiche
            data.save((err, data) => {
                if (err) return res.json({ Errore: err }); //risposta in caso di errore
                return res.status(200).json(data); //risposta se lo spazio è stato salvato nel database
            });
        }
    });
};

//elimina un utente dato l'ID
const cancellaUtente = (req, res) => {
    console.log(
        "Eliminazione di un utente\n\tParametri: " + JSON.stringify(req.params)
    );

    //prendo l'ID dell'utente dai parametri della richiesta
    let id = req.params.id;

    //prima di eliminarlo verifico che l'utente esista
    Utente.findOne({ _id: ObjectId(id) }, (err, data) => {
        if (err || !data) {
            return res
                .status(403)
                .json({ message: "L'utente richiesto non esiste" });
        } else {
            //cerco ed elimino l'utente con quell'ID
            Utente.deleteOne({ _id: ObjectId(id) }, (err) => {
                if (err) {
                    return res.json({
                        message:
                            "Errore nell'eliminazione dell'utente. Errore: " +
                            err,
                    });
                } else
                    return res.status(403).json({
                        message: "Utente eliminato correttamente",
                    });
            });
        }
    });
};

//esporto le funzioni per poterle chiamare dalle route
module.exports = {
    loginUtente,
    registrazione,
    getUtenteConEmail,
    getUtenteConID,
    listaUtenti,
    modificaUtente,
    cancellaUtente,
};
