const Prenotazione = require("../models/prenotazione");
const Utente = require("../models/utente");
const Ricorrenza = require("../models/ricorrenza");
const Spazio = require("../models/spazio");
const Servizio = require("../models/servizio");

var ObjectId = require("mongodb").ObjectId;

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

//FUNZIONI PER LE VARIE ROUTES

const tutti = (req, res) => {
    console.log("Richiesta lista prenotazioni");

    const count = parseInt(req.query.count || 50);
    const start = parseInt(req.query.start || 0);

    if (isNaN(count) || isNaN(start)) {
        return res.status(400).json({ code: 400, message: "start e count devono essere interi" });
    }
    if (count < 1 || start < 0) {
        return res.status(400).json({
            code: 400,
            message: "start deve essere positivo e count maggiore di 0",
        });
    }

    Prenotazione.find({})
        .skip(start)
        .limit(count)
        .populate(populateSpazi)
        .populate(populateRicorrenze)
        .then((data) => {
            if (!data)
                return res.status(204).json({ code: 204, message: "Nessua prenotazione trovata" });
            return res.status(200).json(data);
        })
        .catch((err) => {
            return res.status(500).json({ code: 500, message: err });
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
        return res.status(403).json({ code: 403, message: "Utente non autorizzato" });

    Utente.findOne({ _id: ObjectId(id) }, (err, data) => {
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
                if (err) return res.status(500).json({ code: 500, message: err });
                return res.status(200).json(data);
            });
    });
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
        return res.status(403).json({ code: 403, message: "Utente non autorizzato" });

    // populate Object nested in array ( ricorrenze[i].spaziPrenotati e ricorrenze[i].serviziPrenotati)
    Prenotazione.findOne({ _id: ObjectId(id) })
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
        return res.status(403).json({ code: 403, message: "Utente non autorizzato" });

    Prenotazione.findOne({ _id: ObjectId(id) })
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

        dataInizio = new Date(ricorrenza.inizio);
        dataFine = new Date(ricorrenza.fine);

        const nuovaRicorrenza = new Ricorrenza({
            inizio: dataInizio,
            fine: dataFine,
            spaziPrenotati: ricorrenza.spaziPrenotati,
            serviziPrenotati: ricorrenza.serviziPrenotati,
        });

        promises.push(nuovaRicorrenza.save());
    }
    Promise.all(promises).then((ricorrenzeInserite) => {
        let costo = 0;
        const calcoloCosti = [];
        for (let ricorrenza of ricorrenzeInserite) {
            calcoloCosti.push(
                Servizio.find({
                    _id: { $in: ricorrenza.serviziPrenotati.map((id) => ObjectId(id)) },
                })
                    .then((servizi) => {
                        for (let servizio of servizi) {
                            costo += servizio.prezzoIniziale;
                            costo +=
                                (servizio.prezzoOra * new Date(dataFine - dataInizio).getTime()) /
                                1000 /
                                60 /
                                60;
                        }
                    })
                    .catch((err) => {
                        return res.status(500).json({ code: 500, message: err });
                    })
            );

            calcoloCosti.push(
                Spazio.find({ _id: { $in: ricorrenza.spaziPrenotati.map((id) => ObjectId(id)) } })
                    .then((spazi) => {
                        for (let spazio of spazi) {
                            costo += spazio.prezzoIniziale;
                            costo +=
                                spazio.prezzoOra *
                                (new Date(dataFine - dataInizio).getTime() / 1000 / 60 / 60);
                        }
                    })
                    .catch((err) => {
                        return res.status(500).json({ code: 500, message: err });
                    })
            );
        }

        Promise.all(calcoloCosti).then((processi) => {
            const idInseriti = ricorrenzeInserite.map((ricorrenza) => {
                return ricorrenza._id;
            });
            const nuovaPrenotazione = new Prenotazione({
                proprietario: req.body.proprietario,
                importoPagamento: costo,
                statusPagamento: 0,
                ricorrenze: idInseriti,
                eventoCollegato: req.body.eventoCollegato,
            });
            nuovaPrenotazione.save((err, data) => {
                if (err) return res.status(500).json({ code: 500, message: err });
                return res.status(201).json({ data });
            });
        });
    });
};

// TODO modificaPrenotazione dipende molto da come sono i dati ricevuti dal frontend,
// (soprattutto la parte di aggiornamento ricorrenze, si potrebbero passare due campi nel body: uno contiene
// gli id delle ricorrenze da rimuovere, un altro tutte le ricorrenze da aggiungere)
const modificaPrenotazione = (req, res) => {
    console.log("Modifica di una prenotazione\n\tParams: " + JSON.stringify(req.params));

    let id = req.params.id;

    if (req.utente.livello < 2 && req.utente._id != id)
        return res.status(403).json({ code: 403, message: "Utente non autorizzato" });

    Prenotazione.findOne({ _id: ObjectId(id) }, (err, data) => {
        if (err) return res.status(500).json({ code: 500, message: err });
        if (!data)
            return res.status(404).json({ code: 404, message: "La prenotazione non esiste" });

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
    console.log("Elimina prenotazione\n\tParametri: " + JSON.stringify(req.params));

    let id = req.params.id;

    Prenotazione.findOne({ _id: ObjectId(id) }, (err, data) => {
        if (err) return res.status(500).json({ code: 500, message: err });
        if (!data)
            return res.status(404).json({
                code: 404,
                message: "La prenotazione non esiste",
            });

        if (req.utente.livello < 2 && !req.utente._id.equals(data.proprietario)){
            console.log(req.utente._id);
            console.log(data.proprietario);
            console.log(typeof req.utente._id)
            return res.status(403).json({ code: 403, message: "Utente non autorizzato" });
        }


        const ricorrenze = data.ricorrenze;
        Ricorrenza.deleteMany({ _id: { $in: ricorrenze } })
            .then((data) => {
                Prenotazione.findOneAndDelete({ _id: ObjectId(id) }, (err, data) => {
                    if (err) return res.status(500).json({ code: 500, message: err });
                    return res.status(200).json(data);
                });
            })
            .catch((err) => {
                return res.status(500).json({ code: 500, message: err });
            });
    });
};

module.exports = {
    tutti,
    getPrenotazioniUtente,
    getPrenotazioneConID,
    getRicorrenzePrenotazione,
    nuovaPrenotazione,
    modificaPrenotazione,
    eliminaPrenotazione,
};
