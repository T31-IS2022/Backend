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
        const token = req.headers['token'];
        if (!token){
            return res.status(401).json({message: "Token mancante"});
        }else{
            console.log(token);
        }
    
        jwt.verify(token, process.env.JWT_KEY, (err, decripted)=>{
            if (err)
                return res.status(403).json({message: "Token invalido o scaduto"});
            if (decripted.data.livello<livello){
                return res.status(403).json({message: "Utente non autorizzato"});
            }
            req.utente = decripted.data;
            next(); //passa il controllo al controller specificato
        })
    }
}

module.exports={tokenChecker};
