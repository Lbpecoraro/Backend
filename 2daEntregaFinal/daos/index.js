import config from '../config.js'
import 'dotenv/config'
import { MongoClient } from 'mongodb'
import admin from 'firebase-admin';
import serviceEcommerce from '../coderback.js';


import DaoProdArchivo from './productos/ProductosDaoArchivo.js'
import DaoProdMongo from './productos/ProductosDaoMongoDB.js'
import DaoProdFirebase from './productos/ProductosDaoFirebase.js'

import DaoCartArchivo from './carritos/CarritoDaoArchivo.js';
import DaoCartMongo from './carritos/CarritoDaoMongoDB.js'
import DaoCartFirebase from './carritos/CarritosDaoFirebase.js'

const motor = process.env.DATA_BASE;
let contenedorProdImportado;
let contenedorCarritoImportado;
let conectionMongo;
let db;
let ConnectionFirestore;
if (motor === 'archivo') {
    contenedorProdImportado = new DaoProdArchivo(config.archivo.pathProductos)
    contenedorCarritoImportado = new DaoCartArchivo(config.archivo.pathCarrito)
    console.log('Conectado con archivo');
}
else if (motor === 'mongo') {
    const mongo = new MongoClient(config.mongodb.mongo);
    await mongo.connect();
    conectionMongo = mongo;
    contenedorProdImportado = new DaoProdMongo(config.mongodb.collectionProducts)
    contenedorCarritoImportado = new DaoCartMongo(config.mongodb.collectionCarrito)
    console.log('Conectado con mongo');

}
else if (motor === 'firebase') {
    admin.initializeApp({
        credential: admin.credential.cert(serviceEcommerce),
        databaseURL: config.firebase.url
    });
    db = admin.firestore()
    ConnectionFirestore = db;
    contenedorProdImportado = new DaoProdFirebase(config.firebase.collectionProducts)
    contenedorCarritoImportado = new DaoCartFirebase(config.firebase.collectionCarrito)
    console.log('Conectado con firebase');

}

const ContenedorProductos = contenedorProdImportado;
const ContenedorCarrito = contenedorCarritoImportado;
export { ContenedorProductos,ContenedorCarrito,conectionMongo,ConnectionFirestore };