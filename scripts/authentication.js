const Utente = require("../models/utente");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/*
la funzione tokenChecker genera una funzione middleware che confronta il livello di privilegio del token dato con quello richiesto

livelli:
0: non autenticato
1: utente normale
2: segreteria

NB: teoricamente questa funzione non dovrebbe mai essere chiamata con livello 0
*/

const tokenChecker = (livello)=>{
    return (req, res, next)=>{
        const token = req.headers['token'] || req.cookies['token'];
        if (!token)
            return res.status(401).json({message: "Token mancante"});   
        jwt.verify(token, process.env.JWT_KEY, (err, decripted)=>{
            if (err)
                return res.status(403).json({message: "Token invalido o scaduto"});
            if (decripted.data.livello<livello){
                return res.status(403).json({message: "Utente non autorizzato"});
            }
            Utente.findOne({email:decripted.data.email, password: decripted.data.password})
            .then(data=>{
                if (!data)
                    return res.status(400).json({code:400,message: "Token invalido"});
                req.utente = data;
                next(); //passa il controllo al controller specificato
            }).catch(err=>{
                return res.status(500).json({code:500, message: err});
            });
        });
    }
}

module.exports={tokenChecker};
