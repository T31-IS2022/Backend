const Servizio = require('../models/servizio');
const upload = require('multer')();
var ObjectId = require('mongodb').ObjectID;

const listaServizi = (req, res)=>{
    console.log(`Richiesta di una lista di servizi \n${JSON.stringify(req.query)}`);

    const count = parseInt(req.query.count || 50);
    const start = parseInt(req.query.start || 0);

    if (isNaN(count) || isNaN(start)){
        return res.status(400).json({message: "start e count devono essere interi"});
    }
    if (count<1 || start<0){
        return res.status(400).json({message: "start deve essere positivo e count maggiore di 0"});
    }
    


    Servizio.find({})
    .skip(start)
    .limit(count)
    .then(data=>{
        return res.status(200).json(data);
    })
    .catch(err=>{
        return res.json({Errore: err});
    });
};

const getID = (req, res)=>{
    console.log(`Richiesta di un servizio tramite ID \n${JSON.stringify(req.query)}`);

    const id = req.query.id;
    if (!id){
        return res.status(400).json({
            message: "id non specificato"
        });
    }

    Servizio.findOne({_id: ObjectId(id)})
    .then(data=>{
        if (!data){
            return res.status(404).json({message: "Il servizio richiesto non esiste"});
        }
        return res.status(200).json(data);
    })
    .catch(err=>{
        return res.json({Errore: err});
    });
};

const getDisponibilita = (req, res)=>{
    console.log(`Richiesta della disponibilità di uno spazio in un certo periodo \n${JSON.stringify(req.query)}`);
    
    const id = req.query.id;
    const inizio = req.query.fine;
    const fine = req.query.fine;

    if (!id || !inizio || !fine){
        return res.status(400).json({
            message: `Parametri mancanti: ${(!id)?"id, ":""+(!inizio)?"inizio, ":""+(!fine)?"fine":""}`
        });
    }

    // Qui dobbiamo capire per bene come gestire i servizi nella prenotazione
};

const crea = (req, res)=>{
    console.log(`Richiesta di creazione nuovo spazio \n${JSON.stringify(req.body)}`);

    if (!req.body){
        return res.status(400).json({message: "Parametro mancante: nome"});
    }

    const nome = req.body.nome;
    const descrizione = req.body.descrizione;
    const tipologia = req.body.tipologia;
    const prezzoIniziale = req.body.prezzoIniziale;
    const prezzoOra = req.body.prezzoOra;
    const foto = req.body.foto;

    if (!nome){
        return res.status(400).json({
            message: "Parametro mancante: nome"
        });
    }

    Servizio.count({nome: nome}).
    then(numero=>{
        console.log(numero)
        if (numero==0){ 
            const nuovoServizio = new Servizio({
                nome:nome,
                descrizione: descrizione,
                tipologia: tipologia,
                prezzoIniziale: prezzoIniziale,
                prezzoOra: prezzoOra,
                URLfoto: foto
            });
            console.log(`Nuovo servizio: \n${nuovoServizio}`);
            nuovoServizio.save()
            .then(data=>{
                return res.status(201).json({data});
            })
            .catch(err=>{
                return res.json({Errore: err});
            });
        }else{
            res.status(409).json({
                messaage: `Esiste già un servizio con nome ${nome}`
            });
        }
    })
    .catch(err=>{
        return res.json({Errore: err});
    });
};

const modifica = (req, res)=>{
    console.log(`Richiesta di modifica di un servizio \n${JSON.stringify(req.params)}\n${JSON.stringify(req.body)}`);

    if (!req.body){
        return res.status(400).json({message: "Body della richiesta mancante"});
    }

    const id = req.params.id;
    const nome = req.body.nome;
    const descrizione = req.body.descrizione;
    const tipologia = req.body.tipologia;
    const prezzoIniziale = req.body.prezzoIniziale;
    const prezzoOra = req.body.prezzoOra;
    const foto = req.body.foto;

    if (!id){
        return res.status(400).json({message: "id non specificato"});
    }

    Servizio.count({nome: nome})
    .then(numero=>{
        if (numero>0)
            return res.status(409).json({message: `Esiste già un servizio con il nome '${nome}'`});
        
        Servizio.findOne({_id:ObjectId(id)})
        .then(data=>{
            if (!data){
                return res.status(400).json({message: `L'id ${id} non è associato ad alcun servizio`});
            }
            data.nome = nome || data.nome;
            data.descrizione = descrizione || data.descrizione;
            data.tipologia = tipologia || data.tipologia;
            data.prezzoIniziale = prezzoIniziale || data.prezzoIniziale;
            data.prezzoOra = prezzoOra || data.prezzoOra;
            data.URLfoto = foto || data.URLfoto;

            data.save()
            .then(data=>{
                return res.status(200).json(data);
            })
            .catch(err=>{
                return res.json({Errore: err});
            });
        })
        .catch(err=>{
            return res.json({Errore: err});
        });
    })
    .catch(err=>{
        return res.json({Errore: err});
    });

    /*const modificato = Servizio.findOneAndUpdate({_id:ObjectId(id)},
    {$set: {
        nome: nome,
        descrizione: descrizione,
        tipologia: tipologia,
        prezzoIniziale: prezzoIniziale,
        prezzoOra: prezzoOra,
        IRLfoto: foto
    }});
    if (modificato){
        return res.status(200).json({message: `Il servizio con id ${id} è stato modificato`});
    }else{
        return res.status(304).json({message: `Il servizio con id ${id} non è stato modificato`})
    }*/
};

const cancella = (req, res)=>{
    console.log(`Richiesta di eliminazione di un servizio \n${JSON.stringify(req.params)}`)

    const id = req.params.id;
    if (!id){
        return res.status(400).json({message: "id non specificato"});
    }

    const cancellato = Servizio.deleteOne({_id:ObjectId(id)})
    .then(()=>{
        res.status(200).json({message: `Servizio con id ${id} eliminato`});
    })
    .catch((err)=>{
        res.json({Errore: err});
    });
};

module.exports={
    listaServizi,
    getID,
    getDisponibilita,
    crea,
    modifica,
    cancella
}