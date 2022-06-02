const express = require('express');
const {engine} = require("express-handlebars");
const app = express();
const fs = require('fs');
const {Server:HttpServer} = require('http');
const {Server:SocketServer} = require('socket.io');


app.engine(
    "hbs",
    engine({
        extname: ".hbs",
        defaultLayout: "index.hbs",
    })
);

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));

app.set("views", "./public/hbs_views");
app.set("view engine", "hbs");

class Contenedor {
    constructor(archivo) {
        this.archivo = archivo;
    }
    static id = 0;
    async save(producto) {
        try {
            let json = '';
            let contenido = await fs.promises.readFile(this.archivo, 'utf-8');
            Contenedor.id = contenido === '' ? Contenedor.id : JSON.parse(contenido).length;
            if (contenido === '') {
                console.log('No hay datos');
                if (producto.title == '' || producto.price == '' || producto.thumbnail == '') {
                    console.log('No se puede guardar el producto');
                } else {
                    producto.id = Contenedor.id;
                    json = JSON.stringify([producto]);
                    await fs.promises.writeFile(this.archivo, json, (err) => {
                        if (err) {
                            console.log('Hubo un error al cargar el producto');
                        } else {
                            console.log(producto.id);
                        }
                    })
                    Contenedor.id++;
                }
            } else {
                let productos = JSON.parse(contenido);
                for (let i = 0; i < productos.length; i++) {
                    if (productos[i].title === producto.title || productos[i].thumbnail === producto.thumbnail) {
                        console.log('El producto ya existe');
                    } else if (producto.title == '' || producto.price == '' || producto.thumbnail == '') {
                        console.log('No se pudo cargar el producto, hay campos vacíos');
                    } else {
                        producto.id = Contenedor.id;
                        json = JSON.stringify([...productos, producto]);
                        await fs.promises.writeFile(this.archivo, json, (err) => {
                            if (err) {
                                console.log('Hubo un error al cargar el producto');
                            } else {
                                console.log(producto.id);
                            }
                        })
                    }
                }
                Contenedor.id++;
            }
        } catch (error) {
            console.log(error);
        }
        return producto;
    }
    async getAll() {
        let contenido = await fs.promises.readFile(this.archivo, 'utf-8')
        if (contenido === '') {
            console.log('No hay datos');
            let productos = '';
            return productos;
        } else {
            let productos = JSON.parse(contenido);
            return productos;
        }
    }
}

let contenedorcito = new Contenedor("./productos.txt");

app.get("/", async (req, res) => {
    let productos = await contenedorcito.getAll() === "" ? "" : await contenedorcito.getAll();
    console.log(productos);
    res.render('formulario', {productos});
});

app.post("/productos", async (req, res) => {
    let prod = await contenedorcito.save(req.body);
    if (prod.title === "" || prod.price === "" || prod.thumbnail === "") {
        res.status(400).send({
            error: "No dejes campos vacios"
        })
    } else {
        res.redirect("/")
    }
})

//webSocket

const saveMessage = (message)=>{
let json = '';
let contenido = fs.readFileSync('./mensajes.txt', 'utf-8');
if (contenido === ''){
    json = JSON.stringify([message]);
    fs.writeFileSync('./mensajes.txt', json);
}else {
    let messages = JSON.parse(contenido);
    json = JSON.stringify([...messages,message]);
    fs.writeFileSync('./mensajes.txt', json);
}}

const readMessage = ()=>{
let contenido = fs.readFileSync('./mensajes.txt', 'utf-8');
if(contenido ===''){
return '';
}else {
    return JSON.parse(contenido);
}
}

const httpServer = new HttpServer(app);
const socketServer = new SocketServer(httpServer);

socketServer.on('connection', async (socket)=>{
    socket.emit('messages',await readMessage());
    socket.emit('products',await contenedorcito.getAll());

    socket.on('new_message',async(mensaje)=>{
        console.log(mensaje);
        saveMessage(mensaje);
        let mensajes = await readMessage();
        socketServer.sockets.emit('messages',mensajes);
    });
    socket.on("new_products", async (producto)=>{
        await contenedorcito.save(producto);
        let productos = await contenedorcito.getAll()=== '' ? '' : await contenedorcito.getAll();
        socketServer.sockets.emit('products',productos);
    });
})

httpServer.listen(8080, () => {
    console.log("escuchando en el puerto 8080");
})