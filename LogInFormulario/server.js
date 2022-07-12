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
import { runInNewContext } from 'vm';

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
        mongoUrl: 'mongodb+srv://lbpecoraro:lucia3600@cluster0.pi3nb2l.mongodb.net/?retryWrites=true&w=majority'
    }),
    secret: 'Lucia',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000
    }
}))



app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static("public"));

app.set('views','./public/hbs_views');
app.set('view engine','hbs');


app.get('/',async (req,res) => {

    res.render('logIn')
});

app.get('/logOut',async (req,res) => {
    req.session.destroy((err) => {
        console.log(err);
        console.log('Hasta luego');
    })
    res.render('logOut')
})

app.post('/formulario',async (req,res) => {
    let userName = req.body.nombre;
    req.session.nombre = userName
    req.session.request = req.session.request == null ? 1 : req.session.request + 1
    const mongo = new MongoClient(config.mongodb.mongo);
    await mongo.connect();
    let conectionMongo = mongo
    res.render('formulario')


    socketServer.on('connection',async (socket) => {
        socket.emit('user',userName);
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
                socket.emit('user',userName);
            }
        })
    })


})

const httpServer = new HttpServer(app);
const socketServer = new SocketServer(httpServer);






httpServer.listen(8080,() => {
    console.log('Servidor iniciado');
})