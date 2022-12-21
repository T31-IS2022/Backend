//includo dotenv per poter utilizzare comodamente un file con parametri impostabili
require("dotenv").config();

const express = require("express"); //includo express
const app = express();

console.log("App avviata");

//metto express in ascolto sulla porta specificata nel file .env
app.listen(process.env.PORT, () =>
    console.log("App in ascolto sulla porta " + process.env.PORT)
);

//aggiungere routes
const routesSpazio = require("./routes/spazio");
app.use("/spazio", routesSpazio);

//MONGODB
//importo mongoose
const mongoose = require("mongoose");

//collegamento al database
mongoose.connect(
    process.env.DB_URI,
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
