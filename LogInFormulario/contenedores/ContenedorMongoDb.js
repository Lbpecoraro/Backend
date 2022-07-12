import { conectionMongo } from '../daos/index.js';

class Contenedor {
    constructor(collection) {
        this.collection = collection;
    }

    async save(datos) {
        try {
            await conectionMongo.db('ecommerce').collection(this.collection).insertOne(datos);
        } catch (error) {
            console.log(error);
        }
        return datos;
    }

    async getAll() {
        let contenido = await conectionMongo.db('ecommerce').collection(this.collection).find({}).toArray();
        return contenido;
    }
}

export default Contenedor;