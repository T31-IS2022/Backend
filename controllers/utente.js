//includo il modello dello spazio per poterlo usare qui
const Utente = require("../models/utente");

//includo l'ObjectId per poter cercare elementi tramite il loro ID
var ObjectId = require("mongodb").ObjectID;

//FUNZIONI PER LE VARIE ROUTES

//restituisce tutti gli utenti
const listaUtenti = (req, res) => {
    console.log(
        "Richiesta una lista di utenti\n\tQuery: " + JSON.stringify(req.query)
    );

    //prelevo il numero di utenti da restituire e da quale di essi iniziare
    let count = req.query.count;
    let start = req.query.start;

    //cerco gli spazi dando un filtro vuoto per ottenerli tutti
    Utente.find({}, (err, data) => {
        if (err) {
            return res.json({ Errore: err }); //risposta in caso di errore
        }
        return res.status(200).json(data); //restituisco i dati di tutti gli spazi
    })
        .skip(start)
        .limit(count);
};

//login dell'utente
const loginUtente = (req, res) => {
    console.log(
        "Login dell'utente\n\tQuery: " +
            JSON.stringify(req.query) +
            "\n\tParametri: " +
            JSON.stringify(req.body)
    );

    //prendo l'email dell'utente dai parametri della richiesta
    let email = req.body.email;
    //prendo la password dell'utente dai parametri della richiesta
    let password = req.body.password;

    //se non trovo email e password nella richiesta rispondo con bad request
    if (email == undefined || password == undefined) {
        return res
            .status(400)
            .json({ message: "Specificare email e password" });
    }

    //TODO implementare controllo di sicurezza

    //cerco e restituisco l'utente con quella email e quella password
    Utente.findOne({ email: email, password: password }, (err, data) => {
        if (err || !data) {
            return res.status(401).json({ message: "Email o password errati" });
        } else {
            return res.status(200).json(data); //se trovo l'oggetto lo restituisco
        }
    });
};

//registrazione di un nuovo utente
const registrazione = (req, res) => {
    //stampo le info sulla richiesta
    console.log("Nuovo utente\n\tParametri: " + JSON.stringify(req.body));

    //controllo se un utente con questa email è già stato inserito nel database
    Utente.findOne({ email: req.body.email }, (err, data) => {
        if (!data) {
            //se non l'ho inserito creo un nuovo utente con i dati provenienti dalla richiesta
            const nuovoUtente = new Utente({
                nome: req.body.nome,
                cognome: req.body.cognome,
                email: req.body.email,
                password: req.body.password,
                telefono: req.body.telefono,
                indirizzo: req.body.indirizzo,
                URLfoto: req.body.URLfoto,
            });

            console.log(nuovoUtente);

            //salvo il nuovo utente nel database
            nuovoUtente.save((err, data) => {
                if (err) {
                    return res.json({ Errore: err }); //risposta in caso di errore
                } else {
                    return res.status(201).json(data); //risposta se l'utente è stato salvato nel database
                }
            });
        } else {
            //se non è stato inserito controllo se c'è un errore
            if (err) {
                return res.json("Errore nella registrazione. Errore: " + err);
            } else {
                //altrimenti rispondo dicendo che l'utente è già stato inserito
                return res.status(403).json({
                    message: "E' già presente un utente con questa e-mail",
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

//restituisce le info di uno utente dato l'ID
const getUtenteConID = (req, res) => {
    console.log(
        "Richiesto un utente tramite ID\n\tQuery: " +
            JSON.stringify(req.query) +
            "\n\tParametri: " +
            JSON.stringify(req.params)
    );

    //prendo l'ID dell'utente dai parametri della richiesta
    let id = req.query.ID;
    //cerco e restituisco l'utente con quell'ID'
    Utente.findOne({ _id: ObjectId(id) }, (err, data) => {
        if (err || !data) {
            return res.status(404).json({
                message: "L'utente richiesto non esiste",
            });
        } else return res.status(200).json(data); //se trovo l'oggetto lo restituisco
    });
};

//modifica le informazioni di un utente data l'email
const modificaUtente = (req, res) => {
    console.log(
        "Modifica di un utente\n\tParametri: " + JSON.stringify(req.params)
    );

    //prendo l'ID dell'utente dai parametri della richiesta
    let id = req.params.id;

    //cerco e modifico l'utente con quella email
    Utente.findOne({ _id: ObjectId(id) }, (err, data) => {
        if (err || !data) {
            return res
                .status(404)
                .json({ message: "L'utente richiesto non esiste" });
        } else {
            //modifiche all'utente
            data.nome = req.body.nome;
            data.cognome = req.body.cognome;
            data.email = req.body.email;
            data.password = req.body.password;
            data.telefono = req.body.telefono;
            data.indirizzo = req.body.indirizzo;
            data.URLfoto = req.body.URLfoto;

            //salvo le modifiche
            data.save((err, data) => {
                if (err) return res.json({ Errore: err }); //risposta in caso di errore
                return res.status(200).json(data); //risposta se l'utente è stato salvato nel database
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
