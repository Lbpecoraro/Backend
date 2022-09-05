const config = require('../config.js');
require('dotenv').config()
const { MongoClient } = require('mongodb');


let contenedorCarritoImportado;
let conectionMongo;

const mongo = new MongoClient("mongodb+srv://lbpecoraro:lucia3600@cluster0.pi3nb2l.mongodb.net/?retryWrites=true&w=majority");
(async () => {
    await mongo.connect();
})();
conectionMongo = mongo;


const ContenedorCarrito = contenedorCarritoImportado;
module.exports = { ContenedorCarrito,conectionMongo };