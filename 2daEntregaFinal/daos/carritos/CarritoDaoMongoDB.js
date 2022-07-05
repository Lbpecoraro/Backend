import Contenedor from '../../contenedores/ContenedorMongoDb.js';
import config from '../../config.js';

const contenedorMongo = new Contenedor(config.mongodb.collectionCarrito);

class CarritoDaoMongo {
    constructor(archivo) {
        this.archivo = archivo;
    }

    static _id = 0;
    static timestamp = Date.now();

    async createCarrito() {
        CarritoDaoMongo.timestamp = Date.now();
        let contenido = await contenedorMongo.getAll();
        contenido.forEach(prod => {
            if (CarritoDaoMongo._id <= prod._id) {
                CarritoDaoMongo._id++;
            }
            if (CarritoDaoMongo._id == prod._id) {
                CarritoDaoMongo._id++;
            }
        });
        let carrito = {
            _id: CarritoDaoMongo._id,
            timestamp: CarritoDaoMongo.timestamp,
            productos: []
        }
        await contenedorMongo.save(carrito);
        return carrito;
    }

    async saveProductInCart(id,product) {
        try {
            let carritoElegido = await contenedorMongo.getById(id)
            carritoElegido.productos.push(product);
            await contenedorMongo.updateById(carritoElegido);
        } catch (error) {
            console.log(error);
        }
        return product;
    }

    async getById(id) {
        let carrito = await contenedorMongo.getById(id);
        return carrito;
    }

    async deleteCart(id) {
        await contenedorMongo.deleteById(id);
    }

    async deleteProdInCart(id,prodId) {
        let carrito = await contenedorMongo.getById(id);
        let carritoSinProd = carrito.productos.filter(prod => prod.id !== parseInt(prodId));
        carrito.productos = carritoSinProd;
        await contenedorMongo.updateById(carrito);
        return carrito;
    }

}

export default CarritoDaoMongo;