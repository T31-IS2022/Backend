//includo il modello dello spazio per poterlo usare qui
const Utente = require("../models/utente");

//includo l'ObjectId per poter cercare elementi tramite il loro ID
var ObjectId = require("mongodb").ObjectId;

//FUNZIONI PER LE VARIE ROUTES

//restituisce tutti gli utenti
const listaUtenti = (req, res) => {
    console.log(
        "Richiesta una lista di utenti\n\tQuery: " + JSON.stringify(req.query)
    );

    //prelevo il numero di utenti da restituire e da quale di essi iniziare
    let count = parseInt(req.query.count || 50);
    let start = parseInt(req.query.start || 0);

    if (isNaN(count) || isNaN(start)){
        return res.status(400).json({message: "start e count devono essere interi"});
    }
    if (count<1 || start<0){
        return res.status(400).json({message: "start deve essere positivo e count maggiore di 0"});
    }

    //cerco gli spazi dando un filtro vuoto per ottenerli tutti
    Utente.find({}, (err, data) => {
        if (err) {
            return res.status(500).json({ Errore: err }); //risposta in caso di errore
        }
        return res.status(data?200:204).json(data); //restituisco i dati di tutti gli spazi
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

const logoutUtente = (req,res)=>{
    return res.status(200).json({message:"not implemented"});
}

//registrazione di un nuovo utente
const registrazione = (req, res) => {
    //stampo le info sulla richiesta
    console.log("Nuovo utente\n\tParametri: " + JSON.stringify(req.body));

    const body = req.body;
    if (!body || !(body.email && body.nome && body.cognome && body.password)){
        return res.status(400).json({message: "Parametri mancanti"});
    }

    const nome = body.nome;
    const cognome = body.cognome;
    const email = body.email;
    const password = body.password;
    const telefono = body.telefono || undefined;
    const indirizzo = body.indirizzo || undefined;
    const foto = body.URLfoto || undefined;

    //controllo se un utente con questa email è già stato inserito nel database
    Utente.findOne({ email: email }, (err, data) => {
        if (!data) {
            //se non l'ho inserito creo un nuovo utente con i dati provenienti dalla richiesta
            const nuovoUtente = new Utente({
                nome: nome,
                cognome: cognome,
                email: email,
                password: password,
                telefono: telefono,
                indirizzo: indirizzo,
                URLfoto: foto,
            });

            console.log(nuovoUtente);

            //salvo il nuovo utente nel database
            nuovoUtente.save((err, data) => {
                if (err) {
                    return res.status(500).json({ Errore: err }); //risposta in caso di errore
                } else {
                    return res.status(201).json(data); //risposta se l'utente è stato salvato nel database
                }
            });
        } else {
            //se non è stato inserito controllo se c'è un errore
            if (err) {
                return res.status(500).json("Errore nella registrazione. Errore: " + err);
            } else {
                //altrimenti rispondo dicendo che l'utente è già stato inserito
                return res.status(409).json({
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
    if (!req.query || !req.query.email){
        return res.status(400).json({message: "Email non specificata"});
    }

    let email = req.query.email;
    //cerco e restituisco l'utente con quella email
    Utente.findOne({ email: email }, (err, data) => {
        if (err || !data) {
            return res
                .status(404)
                .json({ message: "L'utente richiesto non esiste" });
        } else return res.status(200).json(data); //se trovo l'oggetto lo restituisco
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
    if (!req.query || !req.query.id){
        return res.status(400).json({message: "id non specificato"});
    }

    let id = req.query.id;
    //cerco e restituisco l'utente con quell'ID'

    if (!ObjectId.isValid(id)){
        return res.status(400).json({message: "id invalido"});
    }

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

    if (!req.params || !req.params.id){
        return res.status(400).json({message: "id non specificato"});
    }

    //prendo l'ID dell'utente dai parametri della richiesta
    const id = req.params.id;

    if (!ObjectId.isValid(id)){
        return res.status(400).json({message: "id invalido"});
    }

    const body = req.body;
    if (!body || !(body.email && body.nome && body.cognome && body.password)){
        return res.status(400).json({message: "Parametri mancanti"});
    }

    const nome = body.nome;
    const cognome = body.cognome;
    const email = body.email;
    const password = body.password;
    const telefono = body.telefono||undefined;
    const indirizzo = body.indirizzo||undefined;
    const foto = body.URLfoto||undefined;

    //cerco e modifico l'utente con quella email
    Utente.findOne({ _id: ObjectId(id) }, (err, data) => {
        if (err || !data) {
            return res
                .status(404)
                .json({ message: "L'utente richiesto non esiste" });
        } else {
            //modifiche all'utente
            data.nome = nome;
            data.cognome = cognome;
            data.email = email;
            data.password = password;
            data.telefono = telefono;
            data.indirizzo = indirizzo;
            data.URLfoto = foto;

            //salvo le modifiche
            data.save((err, data) => {
                if (err) return res.status(500).json({ Errore: err }); //risposta in caso di errore
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

    if (!req.params || !req.params.id){
        return res.status(400).json({message: "id non specificato"});
    }

    //prendo l'ID dell'utente dai parametri della richiesta
    const id = req.params.id;

    if (!ObjectId.isValid(id)){
        return res.status(400).json({message: "id invalido"});
    }

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
                    return res.status(500).json({
                        message:
                            "Errore nell'eliminazione dell'utente. Errore: " +
                            err,
                    });
                } else
                    return res.status(200).json({
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
    logoutUtente,
};
