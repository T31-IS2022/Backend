//includo il modello dello spazio per poterlo usare qui
const Utente = require("../models/utente");
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const servizioMail = require('../scripts/email');
//includo l'ObjectId per poter cercare elementi tramite il loro ID
var ObjectId = require("mongodb").ObjectId;

function generaToken(data) {
    return jwt.sign({ data }, process.env.JWT_KEY, { expiresIn: 86400 });
}

function hashPassword(password, salt){
    return crypto.createHmac(
        'sha256',
        salt        
    )
    .update(password)
    .digest('hex');
}

//FUNZIONI PER LE VARIE ROUTES

//restituisce tutti gli utenti
const listaUtenti = (req, res) => {
    console.log(
        "Richiesta una lista di utenti\n\tQuery: " + JSON.stringify(req.query)
    );

    //prelevo il numero di utenti da restituire e da quale di essi iniziare
    let count = parseInt(req.query.count || 50);
    let start = parseInt(req.query.start || 0);

    if (isNaN(count) || isNaN(start)) {
        return res
            .status(400)
            .json({ message: "start e count devono essere interi" });
    }
    if (count < 1 || start < 0) {
        return res.status(400).json({
            message: "start deve essere positivo e count maggiore di 0",
        });
    }

    //cerco gli spazi dando un filtro vuoto per ottenerli tutti
    Utente.find({}, (err, data) => {
        if (err) {
            return res.status(500).json({ code: 500, message: err }); //risposta in caso di errore
        }
        if (!data)
            return res.status(204).json({code: 204, message:"Nessun utente trovato"});
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

    if (!req.body)
        return res.status(400).json({ code: 400, messsage: "Body mancante" });

    //prendo l'email dell'utente dai parametri della richiesta
    let email = req.body.email;
    //prendo la password dell'utente dai parametri della richiesta
    let password = req.body.password;

    //se non trovo email e password nella richiesta rispondo con bad request
    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Specificare email e password" });
    }

    //cerco e restituisco l'utente con quella email e quella password
    Utente.findOne({ email: email }, (err, data) => {
        if (err)
            return res.status(500).json({code: 500, message: err});
        if (!data)
            return res.status(404).json({code: 404, message: "Email errata" });
        if (data.password != hashPassword(password, data.salt))
            return res.status(404).json({code:404, message: "Password invalida"});
        if (!data.confermaAccount)
            return res.status(400).json({code: 400, message: "L'utente non ha confermato l'account" });
        
        token = generaToken(data);
        return res.status(200).json({token: token}); 
    });
};

const confermaUtente = (req, res) => {
    const id = req.query.id;
    if (!id) {
        return res
            .status(400)
            .json({ code: 400, message: "Parametro mancante: id" });
    }
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ code: 400, message: "id invalido" });
    }

    Utente.findOne({ _id: ObjectId(id) })
        .then((data) => {
            if (!data) {
                res.status(404).json({
                    code: 404,
                    message: `L'id '${id}' non corrisponde a nessun utente`,
                });
            }
            data.confermaAccount = true;
            data.save()
                .then((data) => {
                    return res.status(200).json({
                        code: 200,
                        message: `L'utente con l'id '${id}' è stato confermato`,
                    });
                })
                .catch((err) => {
                    return res.status(500).json({ code: 500, message: err });
                });
        })
        .catch((err) => {
            return res.status(500).json({ code: 500, message: err });
        });
};

//registrazione di un nuovo utente
const registrazione = (req, res) => {
    //stampo le info sulla richiesta
    console.log("Nuovo utente\n\tParametri: " + JSON.stringify(req.body));

    const body = req.body;
    if (!body || !(body.email && body.nome && body.cognome && body.password)){
        return res.status(400).json({code: 400, message: "Parametri mancanti"});
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
        if (err) 
            return res.status(500).json({code: 500, message:err});
        if (data)
            return res.status(409).json({code: 409, message: "E' già presente un utente con questa e-mail"});

        //se non l'ho inserito creo un nuovo utente con i dati provenienti dalla richiesta
        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPsw = hashPassword(password, salt);

        const nuovoUtente = new Utente({
            nome: nome,
            cognome: cognome,
            email: email,
            password: hashedPsw,
            telefono: telefono,
            indirizzo: indirizzo,
            URLfoto: foto,
            salt: salt
        });

        console.log(nuovoUtente);

        //salvo il nuovo utente nel database
        nuovoUtente.save((err, data) => {
            if (err) 
                return res.status(500).json({code: 500, message: err }); //risposta in caso di errore
            
            const id = data._id;
            servizioMail.sendMail({
                from: `t31 <noreply.${process.env.EMAIL_ADDR}>`,
                replyTo: `noreply.${process.env.EMAIL_ADDR}`,
                to: email,
                subject: "Conferma account Makako",
                text: "Conferma il tuo account Makako per poter utilizzare il tuo account",
                html: `<h1>Conferma il tuo account Makako</h1><p>Attiva ora l'account ${nome} ${cognome}</p><br/><a href="${process.env.WEB_ADDR}/utente/conferma?id=${id}">Conferma!</a>`
            }).then(info=>{
                console.log(info);
            }).catch(err=>{
                console.log(err);
            });
            return res.status(201).json(data); //risposta se l'utente è stato salvato nel database
        });
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
    if (!req.query || !req.query.email) {
        return res
            .status(400)
            .json({ code: 400, message: "Email non specificata" });
    }

    let email = req.query.email;
    if (req.utente.livello >= 2 || req.utente.email == email) {
        //cerco e restituisco l'utente con quella email
        Utente.findOne({ email: email }, (err, data) => {
            if (err) return res.status(500).json({ code: 500, message: err });
            if (!data)
                return res.status(404).json({
                    code: 400,
                    message: "L'utente richiesto non esiste",
                });
            return res.status(200).json(data); //se trovo l'oggetto lo restituisco
        });
    } else {
        return res
            .start(403)
            .json({ code: 403, message: "Untente non autorizzato" });
    }
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
    if (!req.query || !req.query.id) {
        return res
            .status(400)
            .json({ code: 400, message: "id non specificato" });
    }

    let id = req.query.id;
    //cerco e restituisco l'utente con quell'ID'

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ code: 400, smessage: "id invalido" });
    }

    Utente.findOne({ _id: ObjectId(id) }, (err, data) => {
        if (err) return res.status(500).json({ code: 500, message: err });
        if (!data)
            return res.status(404).json({
                code: 404,
                message: "L'utente richiesto non esiste",
            });
        return res.status(200).json(data); //se trovo l'oggetto lo restituisco
    });
};

//modifica le informazioni di un utente data l'email
const modificaUtente = (req, res) => {
    console.log(
        "Modifica di un utente\n\tParametri: " + JSON.stringify(req.params)
    );

    if (!req.params || !req.params.id) {
        return res
            .status(400)
            .json({ code: 400, message: "id non specificato" });
    }

    //prendo l'ID dell'utente dai parametri della richiesta
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ code: 400, message: "id invalido" });
    }

    const body = req.body;
    if (!body || !(body.email && body.nome && body.cognome && body.password))
        return res
            .status(400)
            .json({ code: 400, message: "Parametri mancanti" });

    if (req.utente.livello < 2 && req.utente._id != id)
        return res
            .status(403)
            .json({ code: 403, message: "Utente non autorizzato" });

    const nome = body.nome;
    const cognome = body.cognome;
    const email = body.email;
    const password = body.password;
    const telefono = body.telefono || undefined;
    const indirizzo = body.indirizzo || undefined;
    const foto = body.URLfoto || undefined;

    //cerco e modifico l'utente con quella email
    Utente.findOne({ _id: ObjectId(id) }, (err, data) => {
        if (err)
            return res.status(500).json({ code: 500, message: err });
        if (!data)
            return res.status(404).json({ message: "L'utente richiesto non esiste" });

        //modifiche all'utente
        data.nome = nome;
        data.cognome = cognome;
        data.email = email;
        data.password = hashPassword(password,data.salt);
        data.telefono = telefono;
        data.indirizzo = indirizzo;
        data.URLfoto = foto;
        data.salt = data.salt;


        //salvo le modifiche
        data.save((err, data) => {
            if (err) return res.status(500).json({ code: 500, message: err }); //risposta in caso di errore
            return res.status(200).json(data); //risposta se l'utente è stato salvato nel database
        });
    });
};

//elimina un utente dato l'ID
const cancellaUtente = (req, res) => {
    console.log(
        "Eliminazione di un utente\n\tParametri: " + JSON.stringify(req.params)
    );

    if (!req.params || !req.params.id)
        return res
            .status(400)
            .json({ code: 400, message: "id non specificato" });

    //prendo l'ID dell'utente dai parametri della richiesta
    const id = req.params.id;

    if (!ObjectId.isValid(id))
        return res.status(400).json({ code: 400, message: "id invalido" });

    if (req.utente.livello < 2 && req.utente._id != id)
        return res
            .status(403)
            .json({ code: 403, message: "Utente non autorizzato" });

    //prima di eliminarlo verifico che l'utente esista
    Utente.findOne({ _id: ObjectId(id) }, (err, data) => {
        if (err) return res.status(500).json({ code: 500, message: err });
        if (!data)
            return res
                .status(404)
                .json({ code: 404, message: "L'utente richiesto non esiste" });

        //cerco ed elimino l'utente con quell'ID
        Utente.findOneAndDelete({ _id: ObjectId(id) }, (err) => {
            if (err) return res.status(500).json({ code: 500, message: err });
            return res.status(200).json({
                code: 200,
                message: "Utente eliminato correttamente",
            });
        });
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
    confermaUtente,
};
