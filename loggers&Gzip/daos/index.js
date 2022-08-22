const config = require('../config.js');
require('dotenv').config()
const { MongoClient } = require('mongodb');


let contenedorCarritoImportado;
let conectionMongo;

const mongo = new MongoClient(config.mongodb.mongo);
(async () => {
    await mongo.connect();
})();
conectionMongo = mongo;


const ContenedorCarrito = contenedorCarritoImportado;
module.exports = { ContenedorCarrito,conectionMongo };