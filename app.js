require("dotenv").config();

const express = require("express");
const bp = require("body-parser");
const cp = require("cookie-parser");
const cors = require("cors");

const app = express();

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

console.log("Application started");

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(cp());
app.use(
    cors({
        origin: [process.env.FRONTEND_ADDR],
    })
);

app.use("/images", express.static("images"));

const routesServizio = require("./routes/servizio");
app.use("/servizio", routesServizio);

const routesPrenotazione = require("./routes/prenotazione");
app.use("/prenotazione", routesPrenotazione);

const routesRicorrenza = require("./routes/ricorrenza");
app.use("/ricorrenza", routesRicorrenza);

const routesSpazio = require("./routes/spazio");
app.use("/spazio", routesSpazio);

const routesUtente = require("./routes/utente");
app.use("/utente", routesUtente);

//route per la documentazione fornita da Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.static("../images"));

//metto express in ascolto sulla porta specificata nel file .env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("App in ascolto sulla porta " + PORT));

//MONGODB
//importo mongoose
const mongoose = require("mongoose");

//collegamento al database
mongoose.set("strictQuery", false);
mongoose.connect(
    process.env.MONGODB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (err) return console.log("Errore nel collegamento al database: ", err);
        console.log("Connessione a MongoDB -- Stato connessione:", mongoose.connection.readyState);
    }
);
