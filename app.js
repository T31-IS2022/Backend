require("dotenv").config();

// aggiunge le routes all'applicazione

const express = require("express")
const app = express();

console.log("started application");

let port = process.env.PORT || 3000;
app.listen(port, () =>
    console.log("App in ascolto sulla porta " + port)
);

const routesPrenotazione = require("./routes/prenotazione");
app.use("/prenotazione", routesPrenotazione);

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
