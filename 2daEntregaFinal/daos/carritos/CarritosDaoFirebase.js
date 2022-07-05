import Contenedor from '../../contenedores/ContenedorFirebase.js';
import config from '../../config.js';
const contenedorFirebase = new Contenedor(config.firebase.collectionCarrito);


class CarritoDaoFirebase {
    constructor(archivo) {
        this.archivo = archivo;
    }

    static id = 0;
    static timestamp = Date.now();

    async createCarrito() {
        CarritoDaoFirebase.timestamp = Date.now();
        let contenido = await contenedorFirebase.getAll();
        contenido.forEach(prod => {
            if (CarritoDaoFirebase.id <= prod.id) {
                CarritoDaoFirebase.id++;
            }
            if (CarritoDaoFirebase.id == prod.id) {
                CarritoDaoFirebase.id++;
            }
        });
        let carrito = {
            id: CarritoDaoFirebase.id,
            timestamp: CarritoDaoFirebase.timestamp,
            productos: []
        }
        await contenedorFirebase.save(carrito);
        return carrito;
    }

    async saveProductInCart(id,product) {
        try {
            let carritoElegido = await contenedorFirebase.getById(id)
            carritoElegido.productos.push(product);
            await contenedorFirebase.updateById(carritoElegido);
        } catch (error) {
            console.log(error);
        }
        return product;
    }

    async getById(id) {
        let carrito = await contenedorFirebase.getById(id);
        return carrito;
    }

    async deleteCart(id) {
        await contenedorFirebase.deleteById(id);
    }

    async deleteProdInCart(id,prodId) {
        let carrito = await contenedorFirebase.getById(id);
        let carritoSinProd = carrito.productos.filter(prod => prod.id !== parseInt(prodId));
        carrito.productos = carritoSinProd;
        await contenedorFirebase.updateById(carrito);
        return carrito;
    }

}

export default CarritoDaoFirebase;