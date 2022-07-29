import config from '../config.js'
import 'dotenv/config'
import { MongoClient } from 'mongodb'


let contenedorCarritoImportado;
let conectionMongo;

const mongo = new MongoClient(config.mongodb.mongo);
await mongo.connect();
conectionMongo = mongo;
console.log('Conectado con mongo');


const ContenedorCarrito = contenedorCarritoImportado;
export { ContenedorCarrito,conectionMongo };