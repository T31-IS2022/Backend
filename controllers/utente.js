//includo il modello dello spazio per poterlo usare qui
const Utente = require("../models/utente");

//FUNZIONI PER LE VARIE ROUTES

//restituisce tutti gli spazi
const getAllSpaces = (req, res) => {
    console.log(
        "Richiesti tutti gli spazi\n\tQuery: " + JSON.stringify(req.query)
    );

    //cerco gli spazi dando un filtro vuoto per ottenerli tutti
    Space.find({}, (err, data) => {
        if (err) {
            return res.json({ Error: err }); //risposta in caso di errore
        }
        return res.json(data); //restituisco i dati di tutti gli spazi
    });
};

//registrazione di un nuovo utente
const registrazione = (req, res) => {
    //stampo le info sulla richiesta
    console.log("Nuovo utente\n\tParametri: " + JSON.stringify(req.params));

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

            //salvo il nuovo utente nel database
            nuovoUtente.save((err, data) => {
                if (err) {
                    return res.json({ Errore: err }); //risposta in caso di errore
                } else {
                    res.statusCode = 201;
                    return res.json(data); //risposta se l'utente è stato salvato nel database
                }
            });
        } else {
            //se non è stato inserito controllo se c'è un errore
            if (err) {
                return res.json("Errore nella registrazione. Errore: " + err);
            } else {
                //altrimenti rispondo dicendo che l'utente è già stato inserito
                res.statusCode = 403;
                return res.json({
                    message: "E' già presente un utente con questa e-mail",
                });
            }
        }
    });
};

//restituisce le info di uno utente data l'email
const getUtenteConEmail = (req, res) => {
    console.log(
        "Richiesto un utente\n\tQuery: " +
            JSON.stringify(req.query) +
            "\n\tParametri: " +
            JSON.stringify(req.params)
    );

    //prendo l'email dell'utente dai parametri della richiesta
    let email = req.query.email;
    //cerco e restituisco l'utente con quella email
    Utente.findOne({ email: email }, (err, data) => {
        if (err || !data) {
            return res.json({ message: "L'utente richiesto non esiste" });
        } else return res.json(data); //se trovo l'oggetto lo restituisco
    });
};

//restituisce le info di uno utente dato l'ID
const getUtenteConID = (req, res) => {
    console.log(
        "Richiesto un utente\n\tQuery: " +
            JSON.stringify(req.query) +
            "\n\tParametri: " +
            JSON.stringify(req.params)
    );

    //prendo l'ID dell'utente dai parametri della richiesta
    let id = req.query.ID;
    //cerco e restituisco l'utente con quell'ID'
    Utente.findOne({ id: id }, (err, data) => {
        if (err || !data) {
            return res.json({ message: "L'utente richiesto non esiste" });
        } else return res.json(data); //se trovo l'oggetto lo restituisco
    });
};

//modifica le informazioni di un utente data l'email
const modificaUtente = (req, res) => {
    console.log(
        "Modifica di un utente\n\tParametri: " + JSON.stringify(req.params)
    );

    //prendo l'ID dell'utente dai parametri della richiesta
    let id = req.params.ID;
    //cerco e modifico l'utente con quella email
    Utente.findOne({ id: id }, (err, data) => {
        if (err || !data) {
            return res.json({ message: "L'utente richiesto non esiste" });
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
                return res.json(data); //risposta se l'utente è stato salvato nel database
            });
        }
    });
};

//elimina un utente data l'email
const cancellaUtente = (req, res) => {
    console.log(
        "Eliminazione di un utente\n\tParametri: " + JSON.stringify(req.params)
    );

    //prendo l'email dell'utente dai parametri della richiesta
    let email = req.params.email;
    //cerco ed elimino l'utente con quel nome
    Utente.deleteOne({ email: email }, (err) => {
        if (err) {
            return res.json({
                message: "Errore nell'eliminazione dell'utente. Errore: " + err,
            });
        } else return res.json({ message: "Utente eliminato correttamente" });
    });
};

//esporto le funzioni per poterle chiamare dalle route
module.exports = {
    registrazione,
    getUtenteConEmail,
    getUtenteConID,
    modificaUtente,
    cancellaUtente,
};
