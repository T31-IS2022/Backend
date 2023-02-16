const fetch = require("node-fetch")
const Utente = require("../models/utente")
const jwt = require("jsonwebtoken");
require("dotenv").config();

const url = "http://localhost:3000/utente"


const token = 'inserire qui token di livello 2 valido'

// condizioni database per corretto funzionamento dei test:
// 1. esiste Utente con email: test@test e _id: 63ab522e692633bc9b18446f
// 2. non esiste Utente con email: non@esiste

describe('listaUtenti: GET /', () => {
    const api = "/"

    test('start e count non sono di tipo number', async () => {
        expect.assertions(1)
        const response = await fetch(url+api+"?start=abc&count=xyz", {
                method: 'GET',
                headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-access-token': token
                }
            });
        expect(response.status).toEqual(400)
    });

    test('start e count numeri negativi', async () => {
        expect.assertions(1)
        var response = await fetch(url+api+"?start=-1&count=-1", {
            method: 'GET',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded',
                'x-access-token': token
            }
        });

        expect(response.status).toEqual(400)
    });

    test('non vengono passati parametri allora utilizza quelli di default', async () => {
        expect.assertions(1)
        var response = await fetch(url+api, {
            method: 'GET',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded',
                'x-access-token': token
            }
        });

        expect(response.status).toEqual(200)
    });

    test('start=2 e count=5 sono parametri validi', async () => {
        expect.assertions(1)
        var response = await fetch(url+api+"?start=2&count=5", {
            method: 'GET',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded',
                'x-access-token': token
            }
        });

        expect(response.status).toEqual(200)
    });

});

describe('loginUtente: POST /login', () => {
    const api = '/login'

    // utente con queste credenziali esiste nel database di testing
    test('cerca utente con email: test@test e password: test', async () => {
        expect.assertions(1)
        var response = await fetch(url+api, {
            method: 'POST',
            body: {
                email: "test@test",
                password: "test"
            },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        expect(response.status).toEqual(200)

    })

    // utente con queste credenziali NON esiste nel database di testing
    test('cerca utente con email: non@esiste e password: non esiste', async () => {
        expect.assertions(1)
        var response = await fetch(url+api, {
            method: 'POST',
            body: {
                email: "non@esiste",
                password: "non esiste"
            },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        expect(response.status).toEqual(401)

    })

    test('password e email non specificate', async () => {
        expect.assertions(1)
        var response = await fetch(url+api, {
            method: 'POST',
            body: {
                
            },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        expect(response.status).toEqual(400)

    })
})

describe('GET logoutUtente', () => {
    const api = "/logout"
});

describe('registrazione: POST /registrazione', () => {
    const api = "/registrazione"

    test('parametri nuovo utente non specificati', async () => {
        expect.assertions(1)
        var response = await fetch(url+api, {
            method: 'POST',
            body: {
                
            },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        expect(response.status).toEqual(400)
    })

    // email test@test è presente nel database
    test('creazione nuovo utente con email già presente nel database', async () => {
        expect.assertions(1)
        var response = await fetch(url+api, {
            method: 'POST',
            body: {
                nome: 'test',
                cognome: 'test',
                email: 'test@test',
                password: 'test',
                telefono: '123456789',
                indirizzo: 'test',
                URLfoto: 'url/test/foto'
            },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        expect(response.status).toEqual(409)
    });

    test('creazione nuovo utente con dati validi', async () => {
        expect.assertions(1)
        var response = await fetch(url+api, {
            method: 'POST',
            body: {
                nome: 'test',
                cognome: 'test',
                email: 'nuovo@utente',
                password: 'test',
                telefono: '123456789',
                indirizzo: 'test',
                URLfoto: 'url/test/foto'
            },
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // rimuove l'utente appena inserito nel db
        Utente.findOneAndDelete({ email: "nuovo@utente"})

        expect(response.status).toEqual(201)
    })

});

describe('getUtenteConEmail: GET /byEmail', () => {
    const api = "/byEmail"

    test('email non specificata nella query', async () => {
        expect.assertions(1)
        var response = await fetch(url+api+"?", {
            method: 'GET',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        expect(response.status).toEqual(400)
    })

    test('cerca utente che esiste', async () => {
        expect.assertions(1)
        var response = await fetch(url+api+"?email=test@test", {
            method: 'GET',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        expect(response.status).toEqual(200)
    })

    test('cerca utente che non esiste', async () => {
        expect.assertions(1)
        var response = await fetch(url+api+"?email=non@esiste", {
            method: 'GET',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        expect(response.status).toEqual(404)
    })

})

describe('getUtenteConID: GET /byID', () => {
    const api = "/byID"

    test('id non specificata nella query', async () => {
        expect.assertions(1)
        var response = await fetch(url+api+"?", {
            method: 'GET',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        expect(response.status).toEqual(400)
    })

    test('cerca utente con id presente nel database', async () => {
        expect.assertions(1)
        var response = await fetch(url+api+"?id=63ab522e692633bc9b18446f", {
            method: 'GET',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        expect(response.status).toEqual(200)
    })

    test('cerca con id non valido', async () => {
        expect.assertions(1)
        var response = await fetch(url+api+"?id=ID_N0N_VAL1D0", {
            method: 'GET',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        expect(response.status).toEqual(400)
    })

    test('cerca id valido, ma non presente nel database', async () => {
        expect.assertions(1)
        var response = await fetch(url+api+"?id=63ab633e713644bc9b18556f", {
            method: 'GET',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        expect(response.status).toEqual(404)
    })
})

describe('modificaUtente: PATCH /:id', () => {
    const api = "/"

    test('id non specificato nei parametri della richiesta', async () => {
        expect.assertions(1)
        var response = await fetch(url+api, {
            method: 'PATCH',
            body: {
                nome: "nuovoNome",
                cognome: "nuovoCognome",
                email: "nuova@email",
                password: "nuovaPassword1"
            },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        expect(response.status).toEqual(400)
    })

    test('id non valido', async () => {
        expect.assertions(1)
        var response = await fetch(url+api+"/ID_N0N_VAL1D0", {
            method: 'PATCH',
            body: {
                nome: "nuovoNome",
                cognome: "nuovoCognome",
                email: "nuova@email",
                password: "nuovaPassword1"
            },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        expect(response.status).toEqual(400)
    })

    test('id valido, ma parametri del body non specificati', async () => {
        expect.assertions(1)
        var response = await fetch(url+api+"/63ab522e692633bc9b18446f", {
            method: 'PATCH',
            body: {

            },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        expect(response.status).toEqual(400)
    })

    test('id non corrisponde a nessun utente', async () => {
        expect.assertions(1)
        var response = await fetch(url+api+"/64ab533e692622bc9b19556f", {
            method: 'PATCH',
            body: {
                nome: "nuovoNome",
                cognome: "nuovoCognome",
                email: "nuova@email",
                password: "nuovaPassword1"
            },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        expect(response.status).toEqual(404)
    })

    test('modifiche effettuate correttamente', async () => {
        expect.assertions(1)
        var response = await fetch(url+api+"/63ab522e692633bc9b18446f", {
            method: 'PATCH',
            body: {
                nome: 'test',
                cognome: 'test',
                email: 'nuovo@utente',
                password: 'test',
                telefono: '123456789',
                indirizzo: 'test',
                URLfoto: 'url/test/foto'
            },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        expect(response.status).toEqual(200)
    })

})

describe('cancellaUtente: DELETE /:id', () => {
    const api = "/"

    test('id non specificato nei parametri della richiesta', async () => {
        expect.assertions(1)
        var response = await fetch(url+api, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        expect(response.status).toEqual(400)
    })

    test('id non valido', async () => {
        expect.assertions(1)
        var response = await fetch(url+api+"/ID_N0N_VAL1D0", {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        expect(response.status).toEqual(400)
    })

    test('id valido ma non corrisponde a nessun utente', async () => {
        expect.assertions(1)
        var response = await fetch(url+api+"/64ab533e692622bc9b19556f", {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        expect(response.status).toEqual(400)
    })

    test('utente eliminato correttamente', async () => {
        expect.assertions(1)

        const datiNuovoUtente = new Utente({
            nome: "eliminare",
            cognome: "eliminare",
            email: "eliminare@eliminare",
            password: "eliminare",
            telefono: "123456789",
            indirizzo: "eliminare",
            URLfoto: "utente/da/eliminare",
        });

        //salvo il nuovo utente nel database per poi cancellarlo
        const nuovoUtente = await nuovoUtente.save(err, data).exec();

        var response = await fetch(url+api+"/"+nuovoUtente._id, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        expect(response.status).toEqual(200)
    })
})
