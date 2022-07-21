import Contenedor from '../../contenedores/ContenedorMongoDb.js';
import config from '../../config.js';
import util from 'util'
import norm from 'normalizr'


const contenedorMongo = new Contenedor(config.mongodb.collectionMessage);

class MessageDaoMongo {
    constructor(archivo) {
        this.archivo = archivo;
    }

    static _id = 0;
    static timestamp = Date.now();

    async saveMessage(datos) {
        let mensaje = {
            _id: datos._id,
            fyh: datos.fyh,
            author: {
                id: datos.id,
                nombre: datos.nombre,
                apellido: datos.apellido,
                edad: datos.edad,
                alias: datos.alias,
                avatar: datos.avatar,
            },
            text: datos.text
        }
        await contenedorMongo.save(mensaje);
    }

    async getAll() {
        let contenido = await contenedorMongo.getAll();
        const schemaAuthor = new norm.schema.Entity('author',{ idAttribute: '_id' });
        const schemaMessage = new norm.schema.Entity('message',{
            author: schemaAuthor
        },{ idAttribute: '_id' });
        const normalizado = norm.normalize(contenido,[schemaMessage]);

        return normalizado;
    }
}

export default MessageDaoMongo;