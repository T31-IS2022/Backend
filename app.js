require("dotenv").config();

// aggiunge le routes all'applicazione

const express = require("express")
const app = express();

console.log("started application");

// middleware per permettere di interpretare il body come raw json 
app.use(express.json())

app.use(express.urlencoded({extended:false}));

let port = process.env.SERVER_PORT;
app.listen(port, () =>
    console.log("App in ascolto sulla porta " + port)
);

const routesPrenotazione = require("./routes/prenotazione");
const routesRicorrenza = require("./routes/ricorrenza")

app.use("/prenotazione", routesPrenotazione);
app.use("/ricorrenza", routesRicorrenza);

//MONGODB
//importo mongoose
const mongoose = require("mongoose");

//collegamento al database
mongoose.connect(
    process.env.MONGODB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (err)
            return console.log("Errore nel collegamento al database: ", err);
        console.log(
            "Connessione a MongoDB -- Stato connessione:",
            mongoose.connection.readyState
        );
    }
);
