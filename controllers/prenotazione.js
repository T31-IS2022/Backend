const Prenotazione = require("../models/prenotazione");
const Utente = require("../models/utente");
const Ricorrenza = require("../models/ricorrenza");

var ObjectID = require("mongodb").ObjectId;

// json per popolare (fare left join) ai document spazi e servizi, da passare a parametro a .populate
const populateSpazi = {
    path: "ricorrenze",
    populate: {
        path: "spaziPrenotati",
        model: "Spazio",
    },
};

const populateRicorrenze = {
    path: "ricorrenze",
    populate: {
        path: "serviziPrenotati",
        model: "Servizio",
    },
};

// get prenotazione by id
const getPrenotazioneConID = (req, res) => {
    console.log(
        "Richiesta prenotazione by ID\n\tQuery: " +
            JSON.stringify(req.query) +
            "\n\tParametri: " +
            JSON.stringify(req.params)
    );

    const id = req.query.id;

    if (req.utente.livello < 2 && req.utente._id != id)
        return res
            .status(403)
            .json({ code: 403, message: "Utente non autorizzato" });

    // populate Object nested in array ( ricorrenze[i].spaziPrenotati e ricorrenze[i].serviziPrenotati)
    Prenotazione.findOne({ _id: ObjectID(id) })
        .populate(populateSpazi)
        .populate(populateRicorrenze)
        .exec((err, data) => {
            if (err) return res.status(500).json({ code: 500, message: err });
            if (!data)
                return res.status(404).json({
                    code: 404,
                    message: "La prenotazione non esiste",
                });
            return res.status(200).json(data);
        });
};

// get prenotazioni di un utente
const getPrenotazioniUtente = (req, res) => {
    console.log(
        "Richieste prenotazioni di un utente\n\tQuery: " +
            JSON.stringify(req.query) +
            "\n\tParametri: " +
            JSON.stringify(req.params)
    );

    let id = req.query.id;

    if (req.utente.livello < 2 && req.utente._id != id)
        return res
            .status(403)
            .json({ code: 403, message: "Utente non autorizzato" });

    Utente.findOne({ _id: ObjectID(id) }, (err, data) => {
        if (err) return res.status(500).json({ code: 500, message: err });
        if (!data)
            return res.status(404).json({
                code: 404,
                message: "Utente non esiste",
            });
        // trova le prenotazioni dell'utente e le ritorna
        Prenotazione.find({ proprietario: id })
            .populate(populateSpazi)
            .populate(populateRicorrenze)
            .exec((err, data) => {
                if (err)
                    return res.status(500).json({ code: 500, message: err });
                return res.status(200).json(data);
            });
    });
};

// get tutte le ricorrenze di una prenotazione
const getRicorrenzePrenotazione = (req, res) => {
    console.log(
        "Richieste ricorrenze di una prenotazione\n\tQuery: " +
            JSON.stringify(req.query) +
            "\n\tParametri: " +
            JSON.stringify(req.params)
    );

    const id = req.query.id;

    if (req.utente.livello < 2 && req.utente._id != id)
        return res
            .status(403)
            .json({ code: 403, message: "Utente non autorizzato" });

    Prenotazione.findOne({ _id: ObjectID(id) })
        .populate(populateSpazi)
        .populate(populateRicorrenze)
        .exec((err, data) => {
            if (err) return res.status(500).json({ code: 500, message: err });
            if (!data)
                return res.status(404).json({
                    code: 404,
                    message: "La prenotazione non esiste",
                });
            return res.status(200).json(data.ricorrenze);
        });
};

// crea nuova prenotazione

/*
esempio di body, crea prenotazione con due nuove ricorrenze
{
    "proprietario": "639b04848e3edf957bf8302b",
    "pagamento": "63a3a189898364bac0118187",
    "eventoCollegato" : "63a387cc898364bac011817a"
    "ricorrenze": [
        {
            "inizio": "2020-12-21T23:18:18.027+00:00",
            "fine": "2022-12-21T23:18:18.027+00:00",
            "spaziPrenotati": [
                "63a326d39c88f0007ca92dfa",
                "63a326d39c88f0007ca92dfa"
            ],
            "serviziPrenotati": [
                "63a387cc898364bac011817a",
                "63a387cc898364bac011817a"
            ]
        },
        {
            "inizio": "2016-12-21T23:18:18.027+00:00",
            "fine": "2020-12-21T23:18:18.027+00:00",
            "spaziPrenotati": [
                "63a326d39c88f0007ca92dfa"
            ],
            "serviziPrenotati": [
                "63a387cc898364bac011817a",
                "63a387cc898364bac011817a",
                "63a387cc898364bac011817a"
            ]
        }
    ]
}*/
const nuovaPrenotazione = async (req, res) => {
    console.log("Nuova prenotazione\n\tParametri: " + JSON.stringify(req.body));

    // array di nuove ricorrenze da inserire nel db
    let nuoveRicorrenze = req.body.ricorrenze;
    console.log("nuove ricorrenze: " + nuoveRicorrenze);

    // inserisce le ricorrenze nel db e salva gli ObjectId
    const promises = [];
    for (let i = 0; i < nuoveRicorrenze.length; i++) {
        const ricorrenza = nuoveRicorrenze[i];

        console.log(ricorrenza.inizio);

        dataInizio = new Date(ricorrenza.inizio).toISOString();
        dataFine = new Date(ricorrenza.fine).toISOString();

        const nuovaRicorrenza = new Ricorrenza({
            inizio: dataInizio,
            fine: dataFine,
            spaziPrenotati: ricorrenza.spaziPrenotati,
            serviziPrenotati: ricorrenza.serviziPrenotati,
        });

        // utilizzo di Promise invece che callback per salvare le ricorrenze una alla volta
        promises.push(nuovaRicorrenza.save());
        /*if(ricorrenzaSalvata){
            console.log("aggiunta nuova ricorrenza:\n" + ricorrenzaSalvata)
            nuoveRicorrenzeObjId.push(ricorrenzaSalvata._id);
        }*/
    }
    Promise.all(promises).then((ricorrenzeInserite) => {
        const idInseriti = ricorrenzeInserite.map((ricorrenza) => {
            return ricorrenza._id;
        });
        const nuovaPrenotazione = new Prenotazione({
            proprietario: req.body.proprietario,
            importoPagamento: 0, //TODO calcolare il totale da pagare tramite le ricorrenze, gli spazi e i servizi prenotati
            statusPagamento: 0,
            ricorrenze: idInseriti,
            eventoCollegato: req.body.eventoCollegato,
        });
        nuovaPrenotazione.save((err, data) => {
            if (err) return res.status(500).json({ code: 500, message: err });
            return res.status(201).json({ code: 201, message: data });
        });
    });
};

// TODO modificaPrenotazione dipende molto da come sono i dati ricevuti dal frontend,
// (soprattutto la parte di aggiornamento ricorrenze, si potrebbero passare due campi nel body: uno contiene
// gli id delle ricorrenze da rimuovere, un altro tutte le ricorrenze da aggiungere)
const modificaPrenotazione = (req, res) => {
    console.log(
        "Modifica di una prenotazione\n\tParams: " + JSON.stringify(req.params)
    );

    let id = req.params.id;

    if (req.utente.livello < 2 && req.utente._id != id)
        return res
            .status(403)
            .json({ code: 403, message: "Utente non autorizzato" });

    Prenotazione.findOne({ _id: ObjectID(id) }, (err, data) => {
        if (err) return res.status(500).json({ code: 500, message: err });
        if (!data)
            return res
                .status(404)
                .json({ code: 404, message: "La prenotazione non esiste" });

        // modifica la prenotazione
        data.proprietario = req.body.proprietario;
        data.pagamento = req.body.pagamento;
        data.ricorrenze = req.body.ricorrenze; // ricorrenze è array di ObjectId quindi il client non può aggiungere ricorrenze (da implementare guarda TODO)
        data.eventoCollegato = req.body.eventoCollegato;

        data.save((err, data) => {
            if (err) return res.status(500).json({ code: 500, message: err });
            return res.status(200).json(data);
        });
    });
};

// elimina prenotazione
const eliminaPrenotazione = (req, res) => {
    console.log(
        "Elimina prenotazione\n\tParametri: " + JSON.stringify(req.params)
    );

    let id = req.params.id;

    if (req.utente.livello < 2 && req.utente._id != id)
        return res
            .status(403)
            .json({ code: 403, message: "Utente non autorizzato" });

    Prenotazione.findOne({ _id: ObjectID(id) }, (err, data) => {
        if (err) return res.status(500).json({ code: 500, message: err });
        if (!data)
            return res.status(404).json({
                code: 404,
                message: "La prenotazione non esiste",
            });
        Prenotazione.deleteOne({ _id: ObjectID(id) }, (err, data) => {
            if (err) return res.status(500).json({ code: 500, message: err });
            return res.status(200).json(data);
        });
    });
};

module.exports = {
    getPrenotazioneConID,
    getPrenotazioniUtente,
    getRicorrenzePrenotazione,
    nuovaPrenotazione,
    modificaPrenotazione,
    eliminaPrenotazione,
};
