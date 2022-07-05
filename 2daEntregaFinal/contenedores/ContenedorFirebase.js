import { ConnectionFirestore } from '../daos/index.js'
class Contenedor {
    constructor(collection) {
        this.collection = collection;
    }

    async save(datos) {
        let query = ConnectionFirestore.collection(this.collection);
        try {
            await query.doc(`${datos.id}`).create(datos);
        } catch (error) {
            console.log(error);
        }
        return datos;
    }


    async getById(id) {
        let query = ConnectionFirestore.collection(this.collection);
        const doc = query.doc(`${id}`)
        const item = await doc.get();
        let producto = item.data()
        if (producto) {
            console.log('Existe!');
        } else {
            console.log('No existe');
        }
        return producto;
    }

    async getAll() {
        let query = ConnectionFirestore.collection(this.collection);
        let queryContent = await query.get();
        let contenido = queryContent.docs;
        let response = []
        if (contenido !== undefined) {
            response = contenido.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
        }
        return response;
    }

    async deleteById(id) {
        let query = ConnectionFirestore.collection(this.collection);
        await query.doc(`${id}`).delete()
        console.log('se ha Eliminado');
    }

    async updateById(productoActualizado) {
        let query = ConnectionFirestore.collection(this.collection);
        let prodAct = await query.doc(`${productoActualizado.id}`).update(productoActualizado)
        return prodAct;
    }
}

export default Contenedor;