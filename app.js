require("dotenv").config();

// aggiunge le routes all'applicazione

const express = require("express")
const app = express();

console.log("started application");

//aggiungere routes
const routesServizio = require("./routes/servizio");
app.use("/servizio", routesServizio);

const routesPrenotazione = require("./routes/prenotazione");
app.use("/prenotazione", routesPrenotazione);

const routesRicorrenza = require("./routes/ricorrenza")
app.use("/ricorrenza", routesRicorrenza);

const routesSpazio = require("./routes/spazio");
app.use("/spazio", routesSpazio);

const routesUtente = require("./routes/utente");
app.use("/utente", routesUtente);

//metto express in ascolto sulla porta specificata nel file .env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log("App in ascolto sulla porta " + PORT)
);

//MONGODB
//importo mongoose
const mongoose = require("mongoose");

//collegamento al database
mongoose.set('strictQuery', false);
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