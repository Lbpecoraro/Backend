import express,{ json,urlencoded } from 'express';
const app = express();
import { engine } from "express-handlebars"
import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { faker } from '@faker-js/faker';
import config from './config.js'
import DaoCartMongo from './daos/mensajes/MessageDaoMongoDB.js';

let contenedorCarritoImportado = new DaoCartMongo(config.mongodb.collectionMessage)

app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        defaultLayout: 'index.hbs',
    })
);

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static("public"));

app.set('views','./public/hbs_views');
app.set('view engine','hbs');

app.get('/',async (req,res) => {
    res.render('formulario');
});


const httpServer = new HttpServer(app);
const socketServer = new SocketServer(httpServer);



socketServer.on('connection',async (socket) => {
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
})


httpServer.listen(8080,() => {
    console.log('Servidor iniciado');
})