//ACÁ CREO UN CONTENEDOR QUE VA A TENER MÉTODOS CON NOMBRES DISTINTOS, PERO QUE APLIQUEN LOS MÉTODOS DEL ContenedorArchivo.
//ESTE DAO VA A SER LLAMADO DESDE EL ROUTER PARA EJECUTARSE LUEGO EN EL SERVIDOR.
import express from 'express';
const app = express();
import Contenedor from '../../contenedores/ContenedorArchivo.js';
import config from '../../config.js'
const contenedorArchivo = new Contenedor(config.archivo.pathCarrito);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

class CarritoDaoArchivo {
    constructor(archivo) {
        this.archivo = archivo;
    }

    static id = 0;
    static timestamp = Date.now();

    async createCarrito() {
        CarritoDaoArchivo.timestamp = Date.now();
        let contenido = await contenedorArchivo.getAll();
        contenido.forEach(prod => {
            if (CarritoDaoArchivo.id <= prod.id) {
                CarritoDaoArchivo.id++;
            }
            if (CarritoDaoArchivo.id == prod.id) {
                CarritoDaoArchivo.id++;
            }
        });
        let carrito = {
            id: CarritoDaoArchivo.id,
            timestamp: CarritoDaoArchivo.timestamp,
            productos: []
        }
        let json = '';
        json = JSON.stringify([...contenido,carrito]);
        await contenedorArchivo.save(json);
        return carrito;
    }

    async saveProductInCart(id,product) {
        let json = '';
        let contenido = await contenedorArchivo.getAll();
        try {
            let carritoElegido = contenido.find(cart => cart.id === id);
            // let producto = JSON.stringify(product)
            carritoElegido.productos.push(product);
            json = JSON.stringify(contenido);
            await contenedorArchivo.save(json);
        } catch (error) {
            console.log(error);
        }
        return contenido;
    }

    async getById(id) {
        let contenido = await contenedorArchivo.getById(id);
        return contenido;
    }

    async deleteCart(id) {
        let contenido = await contenedorArchivo.getAll();
        let arraySinElCarrito = await contenido.filter(cart => cart.id !== parseInt(id));
        await contenedorArchivo.save(JSON.stringify(arraySinElCarrito));
        return contenido;
    }

    async deleteProdInCart(id,prodId) {
        let contenido = await contenedorArchivo.getAll();
        let carrito = await contenido.find(cart => cart.id === parseInt(id));
        let carritoSinProd = await carrito.productos.filter(prod => prod.id !== parseInt(prodId));
        carrito.productos = carritoSinProd;
        await contenedorArchivo.save(JSON.stringify(contenido));
        return contenido;
    }

}

export default CarritoDaoArchivo;