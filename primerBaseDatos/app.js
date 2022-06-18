const express = require('express');
const { engine } = require("express-handlebars");
const app = express();
const { Server: HttpServer } = require('http');
const { Server: SocketServer } = require('socket.io');
const Knex = require('knex').default


//Conección con SQLite
const knexSQLite = Knex({
    client: 'sqlite3',
    connection: { filename: './DB/ecommerce.sqlite' },
    useNullAsDefault: true
})
//Conección con MySQL
const options = {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'productsDB'
}
const knexMySQL = Knex({
    client: 'mysql',
    connection: options
})

const createTableMySQL = async () => {
    await knexMySQL.schema.createTable('productos',(table) => {
        table.increments('id').primary().notNullable();
        table.string('title').notNullable();
        table.string('thumbnail').notNullable();
        table.integer('price').notNullable();
    }).catch((err) => {
        console.log('ERROR: ' + err);
    })
}
createTableMySQL();
const createTableSQLite = async () => {
    await knexSQLite.schema.createTable('messages',(table) => {
        table.increments('id').primary().notNullable();
        table.string('author').notNullable();
        table.string('text').notNullable();
        table.integer('fyh').notNullable();
    }).catch((err) => {
        console.log('ERROR: ' + err);
    })
}
createTableSQLite();

app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        defaultLayout: 'index.hbs',
    })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.set('views','./public/hbs_views');
app.set('view engine','hbs');



//Guardar un nuevo producto
const save = async (producto) => {
    let contenido = await knexMySQL.select('*').from('productos');
    let existe = false;
    contenido.forEach(async (item) => {
        if (item.title === producto.title || item.thumbnail === producto.thumbnail || item.price === producto.price) {
            existe = true;
            console.log('El producto ya existe');
        }
    })
    existe ? console.log('No se pudo cargar el producto porque ya existe') : await knexMySQL('productos').insert([{ title: producto.title,thumbnail: producto.thumbnail,price: producto.price }])
    return producto;
}

//Obtener todos los productos
const getAll = async () => {
    let contenido = await knexMySQL.select('*').from('productos');
    if (contenido === '') {
        console.log('No hay datos');
        let productos = '';
        return productos;
    } else {
        let productos = contenido
        return productos;
    }
}
app.get('/',async (req,res) => {
    let productos = await getAll() === '' ? '' : await getAll();
    console.log(productos);
    res.render('formulario',{ productos });
});
app.post('/productos',async (req,res) => {
    let prod = req.body;
    if (prod.title === '' || prod.price === '' || prod.thumbnail === '') {
        res.status(400).send({ error: 'El producto no se pudo cargar, hay campos vacios' });
    } else {
        await save(req.body);
        res.redirect('/');
    }
})
// Websockets
const saveMessage = async (message) => {
    await knexSQLite('messages').insert([{ author: message.autor,text: message.text,fyh: message.fyh }]);
}
const readMessage = async () => {
    let contenido = await knexSQLite.select('*').from('messages');
    if (contenido === '') {
        return '';
    } else {
        return contenido;
    }
}

const httpServer = new HttpServer(app);
const socketServer = new SocketServer(httpServer);
socketServer.on('connection',async (socket) => {
    socket.emit('messages',await readMessage())
    socket.emit('products',await getAll())
    socket.on('new_message',async (mensaje) => {
        console.log(mensaje);
        saveMessage(mensaje);
        let mensajes = await readMessage();
        socketServer.sockets.emit('messages',mensajes);
    });
    socket.on('new_products',async (product) => {
        await save(product)
        let productos = await getAll() === '' ? '' : await getAll();
        socketServer.sockets.emit('products',productos);
    });
})
httpServer.listen(8080,() => {
    console.log('Servidor corriendo en puerto 8080!');
})























