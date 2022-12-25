//includo dotenv per poter utilizzare comodamente un file con parametri impostabili
require("dotenv").config();

const express = require("express"); //includo express
const app = express();

console.log("App avviata");

//metto express in ascolto sulla porta specificata nel file .env
app.listen(process.env.PORT || 3000, () =>
    console.log("App in ascolto sulla porta " + process.env.PORT)
);

//aggiungere routes
const routesServizio = require("./routes/servizio");
app.use("/servizio", routesServizio);

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