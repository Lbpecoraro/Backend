import express,{ json,urlencoded } from 'express';
const app = express();
import { engine } from "express-handlebars"
import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { faker } from '@faker-js/faker';
import config from './config.js'
import DaoCartMongo from './daos/mensajes/MessageDaoMongoDB.js';
import cookieParser from 'cookie-parser'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import { MongoClient } from 'mongodb'
import passport from './passport.js'
import 'dotenv/config'
import yargs from 'yargs'
import process from 'process'
import { fork } from 'child_process';


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
    secret: 'Lucia',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 600000
    }
}))


const argumentos = process.argv.slice(2);
const parsear = yargs(argumentos).default({
    port: 0
}).alias({
    p: "port"
}).argv;

const info = (req,res) => {
    const info = {
        arguments: process.argv.slice(2),
        platform: process.platform,
        nodeVersion: process.version,
        memoryTotalReserved: process.memoryUsage().rss,
        execPath: process.execPath,
        pid: process.pid,
        proyectPath: process.cwd(),
    }
    res.render('info',{ info: info })
    console.log(info);
}

app.get('/info',info)

app.get('/randoms/:cantidad?',(req,res) => {
    let cantidad = req.params.cantidad || "100000000";
    let calculoFork = fork('./calculoFork.js');
    calculoFork.send(cantidad);
    calculoFork.on('message',(msj) => {
        res.send(msj)
    })
})


app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static("public"));

app.set('views','./public/hbs_views');
app.set('view engine','hbs');

//Conección con mongo
const mongo = new MongoClient(config.mongodb.mongo);
await mongo.connect();
let conectionMongo = mongo

app.get('/',async (req,res) => {
    res.render('logIn')
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

const httpServer = new HttpServer(app);
const socketServer = new SocketServer(httpServer);


let puerto = parsear.p || 8080
httpServer.listen(puerto,() => {
    console.log('Servidor iniciado en el puerto:' + puerto);
})