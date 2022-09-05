const express = require('express');
const { json,urlencoded } = require('express');
const app = express();
const { engine } = require('express-handlebars');
const { Server: HttpServer } = require('http');
const { Server: SocketServer } = require('socket.io');
const { faker } = require('@faker-js/faker');
const config = require('./config.js');
const DaoCartMongo = require('./daos/mensajes/MessageDaoMongoDB.js');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { MongoClient } = require('mongodb');
const passport = require('./passport.js');
require('dotenv').config()
const yargs = require('yargs');
const process = require('process');
const { fork } = require('child_process');
const cluster = require('cluster');
const os = require('os');
const { cpus } = require('os');
const logger = require('./pino.js');
const autocannon = require('autocannon');

let contenedorCarritoImportado = new DaoCartMongo(config.mongodb.collectionMessage)

app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        defaultLayout: 'index.hbs',
    })
);

app.use(cookieParser())
// const advancedOptions = { useNewUrlParse: true,useUnifiedTopology: true }

app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO
    }),
    secret: 'Matias',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 600000
    }
}))


const argumentos = process.argv.slice(2);
const parsear = yargs(argumentos).default({
    port: 0,
    modo: 'FORK'
}).alias({
    p: "port",
    m: "modo"
}).argv;

let puerto = process.env.PORT || 8080

const info = (req,res) => {
    const info = {
        arguments: process.argv.slice(2),
        platform: process.platform,
        nodeVersion: process.version,
        memoryTotalReserved: process.memoryUsage().rss,
        execPath: process.execPath,
        pid: process.pid,
        proyectPath: process.cwd(),
        CPUS: cpus().length
    }
    res.render('info',{ info: info })
    logger.info(info)
}

app.get('/info',info)

app.get('/randoms/:cantidad?',(req,res) => {
    let cantidad = req.params.cantidad || "100000000";
    let calculoFork = fork('./calculoFork.js');
    calculoFork.send(cantidad);
    calculoFork.on('message',(msj) => {
        res.send(msj)
    })
    // res.send(`NGINX corriendo en el puerto ${puerto} por PID ${process.pid}`);
})


app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static("public"));

app.set('views','./public/hbs_views');
app.set('view engine','hbs');

//Conección con mongo
const mongo = new MongoClient(config.mongodb.mongo);
(async () => {
    await mongo.connect();
})();
let conectionMongo = mongo

app.get('/',async (req,res) => {
    res.render('logIn')
    // res.send(`NGINX corriendo en el puerto ${puerto} por PID ${process.pid}`);
});

app.post('/',passport.authenticate('login',{ failureRedirect: '/signIn',failureMessage: true }),passport.authenticate('autenticado',{ failureRedirect: '/',failureMessage: true }),async (req,res) => {
    res.redirect('/formulario/' + req.body.username)
})

app.get('/logOut',async (req,res) => {
    req.session.destroy((err) => {
        console.log(err);
        console.log('Hasta luego');
    })
    res.render('logOut')
})

app.get('/signIn',async (req,res) => {
    res.render('signIn')
})

app.post('/signIn',passport.authenticate('registracion',{ failureRedirect: '/',failureMessage: true }),async (req,res) => {
    res.redirect('/formulario/' + req.body.username)
})

app.get('/formulario/:username',async (req,res) => {
    const mongo = new MongoClient(config.mongodb.mongo);
    await mongo.connect();
    let username = req.params.username;
    req.session.username = username;
    req.session.request = req.session.request == null ? 1 : req.session.request + 1
    res.render('formulario')

    socketServer.on('connection',async (socket) => {
        socket.emit('user',username);
        socket.emit('messages',await contenedorCarritoImportado.getAll())
        let productos = [
            {
                nombre: faker.name.findName(),
                precio: faker.commerce.price(),
                foto: faker.image.imageUrl()
            },
            {
                nombre: faker.name.findName(),
                precio: faker.commerce.price(),
                foto: faker.image.imageUrl()
            },
            {
                nombre: faker.name.findName(),
                precio: faker.commerce.price(),
                foto: faker.image.imageUrl()
            },
            {
                nombre: faker.name.findName(),
                precio: faker.commerce.price(),
                foto: faker.image.imageUrl()
            },
            {
                nombre: faker.name.findName(),
                precio: faker.commerce.price(),
                foto: faker.image.imageUrl()
            },
        ]
        socket.emit('products',productos)

        socket.on('new_message',async (mensaje) => {
            console.log(mensaje);
            await contenedorCarritoImportado.saveMessage(mensaje)
            let mensajes = await contenedorCarritoImportado.getAll();
            socketServer.sockets.emit('messages',mensajes);
        });

        socket.on('new_products',async (products) => {
            let productos = products
            socketServer.sockets.emit('products',productos);
        });

        socket.on('new_user',async (user) => {
            let sesion = await conectionMongo.db('test').collection('sessions').find({}).toArray();
            console.log(sesion);
            let usuario = sesion[sesion.length - 1];
            if (usuario === undefined) {
                console.log('Sesión cerrada');
                socket.emit('user',false);
            } else {
                socket.emit('user',username);
            }
        })
    })


})

app.use((req,res,next) => {
    logger.warn('Ruta invalida')
    res.sendStatus(404)
})

const httpServer = new HttpServer(app);
const socketServer = new SocketServer(httpServer);

const numCPU = require("os").cpus().length
const modo = parsear.m || 'FORK'
if (modo == 'CLUSTER') {
    if (cluster.isPrimary) {
        for (let i = 0; i < numCPU; i++) {
            cluster.fork()
        }
    } else {
        httpServer.listen(puerto,(err) => {
            console.log(`Escuchando en el puerto ${puerto}`)
            if (err) {
                logger.error('Hubo un error :' + err)
            }
        });
        httpServer.on("error",(error) => {
            console.error(error,"error de conexión")
            logger.error('Hubo un error :' + error)
        });
    }
}
if (modo == 'FORK') {
    httpServer.listen(puerto,(err) => {
        console.log(`Escuchando en el puerto ${puerto}`);
        if (err) {
            logger.error('Hubo un error :' + err)
        }
    });
    httpServer.on("error",(error) => {
        console.error(error,"error de conexión")
        logger.error('Hubo un error :' + error)
    });
}
