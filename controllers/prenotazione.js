const Prenotazione = require("../models/prenotazione")
const Utente = require("../models/utente")
const Ricorrenza = require("../models/ricorrenza")

var ObjectID = require("mongodb").ObjectId;

// json per popolare (fare left join) ai document spazi e servizi, da passare a parametro a .populate
const populateSpazi = {
    path: 'ricorrenze',
    populate: {
        path: 'spaziPrenotati',
        model: 'Spazio'
    }
}

const populateRicorrenze = {
    path: 'ricorrenze',
    populate: {
        path: 'serviziPrenotati',
        model: 'Servizio'
    }
}

// get prenotazione by id
const getPrenotazioneConID = (req, res) => {
    console.log(
        "Richiesta prenotazione by ID\n\tQuery: " +
        JSON.stringify(req.query) +
        "\n\tParametri: " +
        JSON.stringify(req.params)
    );

    let id = req.query.id;

    // populate Object nested in array ( ricorrenze[i].spaziPrenotati e ricorrenze[i].serviziPrenotati)
    Prenotazione.findOne({ _id: ObjectID(id)})
                .populate(populateSpazi)
                .populate(populateRicorrenze)
                .exec((err, data) => {
                    if(err || !data){
                        return res.status(404).json({
                            message: "La prenotazione non esiste",
                        })
                    }
                    else return res.status(200).json(data);
                });
}

// get prenotazioni di un utente
const getPrenotazioniUtente = (req, res) => {
    console.log(
        "Richieste prenotazioni di un utente\n\tQuery: " +
        JSON.stringify(req.query) +
        "\n\tParametri: " +
        JSON.stringify(req.params)
    );

    let id = req.query.id;

    Utente.findOne({_id: ObjectID(id)}, (err, data) =>{
        if(err || !data){
            return res.status(404).json({
                message: "Utente non esiste"
            });
            
        }
        else{
            // trova le prenotazioni dell'utente e le ritorna
            Prenotazione.find({ proprietario: id})
                        .populate(populateSpazi)
                        .populate(populateRicorrenze)
                        .exec((err, data) => {
                            return res.status(200).json(data);
                        }); 
        }
    });
}

// get tutte le ricorrenze di una prenotazione
const getRicorrenzePrenotazione = (req, res) => {
    console.log(
        "Richieste ricorrenze di una prenotazione\n\tQuery: " +
        JSON.stringify(req.query) +
        "\n\tParametri: " +
        JSON.stringify(req.params)
    );

    const id = req.query.id;

    Prenotazione.findOne({ _id: ObjectID(id)})
                .populate(populateSpazi)
                .populate(populateRicorrenze)
                .exec((err, data) => {
                    if(err || !data){
                        return res.status(404).json({
                            message: "La prenotazione non esiste",
                        });
                    }
                    else return res.status(200).json(data.ricorrenze);
                });
}


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
    console.log("nuove ricorrenze: " + nuoveRicorrenze)

    // array di ObjectId delle ricorrenze inserite nel db
    let nuoveRicorrenzeObj = [];

    // inserisce le ricorrenze nel db e salva gli ObjectId
    for(let i=0; i<nuoveRicorrenze.length; i++){
        let ricorrenza = nuoveRicorrenze[i];

        let nuovaRicorrenza = new Ricorrenza({
            inizio: ricorrenza.inizio,
            fine: ricorrenza.fine,
            spaziPrenotati: ricorrenza.spaziPrenotati,
            serviziPrenotati: ricorrenza.serviziPrenotati
        });

        // utilizzo di Promise invece che callback per salvare le ricorrenze una alla volta
        try{
            let ricorrenzaSalvata = await nuovaRicorrenza.save();
                
            if(ricorrenzaSalvata){
                console.log("aggiunta nuova ricorrenza:\n" + ricorrenzaSalvata)
                nuoveRicorrenzeObj.push(ricorrenzaSalvata._id);
            }

        } catch(err){ console.log("Errore salvando una ricorrenza:\n" + err); }
    }

    const nuovaPrenotazione = new Prenotazione({
        proprietario: req.body.proprietario,
        pagamento: req.body.pagamento,
        ricorrenze: nuoveRicorrenzeObj,
        eventoCollegato: req.body.eventoCollegato
    });

    nuovaPrenotazione.save((err, data) => {
        if(err){
            return res.sendStatus(400).json(err);
        }
        else{
            return res.sendStatus(201);
        }
    });
}


// TODO modificaPrenotazione dipende molto da come sono i dati ricevuti dal frontend,
// (soprattutto la parte di aggiornamento ricorrenze, si potrebbero passare due campi nel body: uno contiene
// gli id delle ricorrenze da rimuovere, un altro tutte le ricorrenze da aggiungere)
const modificaPrenotazione = (req, res) => {
    console.log(
        "Modifica di una prenotazione\n\tParams: " + JSON.stringify(req.params)
    );

    let id = req.params.id;

    Prenotazione.findOne({ _id: ObjectID(id) }, (err, data) =>{
        if(err || !data){
            return res.status(404).json({ message: "La prenotazione non esiste"});
        }
        else{
            // modifica la prenotazione
            data.proprietario = req.body.proprietario;
            data.pagamento = req.body.pagamento;
            data.ricorrenze = req.body.ricorrenze; // ricorrenze è array di ObjectId quindi il client non può aggiungere ricorrenze (da implementare guarda TODO)
            data.eventoCollegato = req.body.eventoCollegato;

            data.save((err, data) => {
                if (err){
                    return res.json({ Errore: err })
                }
                else return res.status(200).json(data);
                
            });
        }
    });
}


// elimina prenotazione
const eliminaPrenotazione = (req, res) => {
    console.log(
        "Elimina prenotazione\n\tParametri: " + JSON.stringify(req.params)
    );

    let id = req.params.id;

    Prenotazione.findOne({_id: ObjectID(id)}, (err, data) => {
        if(err || !data){
            return res.status(404).json({
                message: "La prenotazione non esiste",
            });
        }
        else{
            Prenotazione.deleteOne({_id: ObjectID(id)}, (err, data) => {
                if(err){
                    return res.json(err);
                }
                else{
                    return res.status(200).json(data);
                }
            });
        }
    });
}


module.exports = {
    getPrenotazioneConID,
    getPrenotazioniUtente,
    getRicorrenzePrenotazione,
    nuovaPrenotazione,
    modificaPrenotazione,
    eliminaPrenotazione
}


