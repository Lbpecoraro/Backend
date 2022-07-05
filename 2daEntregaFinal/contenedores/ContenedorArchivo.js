import express from 'express';
const app = express();
import fs from 'fs';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PRODUCT ROUTER
class Contenedor {
    constructor(archivo) {
        this.archivo = archivo;
    }

    async save(json,prodAgregado) {
        try {
            await fs.promises.writeFile(this.archivo,json,(err) => {
                if (err) {
                    console.log('Hubo un error al cargar el producto');
                } else {
                    console.log(prodAgregado.id);
                }
            })
        } catch (error) {
            console.log(error);
        }
        return prodAgregado;
    }


    async getById(id) {
        let contenido = await fs.promises.readFile(this.archivo,'utf-8')
        let productos = JSON.parse(contenido);
        let producto = productos.find(producto => producto.id === id);
        if (producto) {
            console.log('Existe!');
        } else {
            console.log('No existe');
        }
        return producto;
    }

    async getAll() {
        let contenido = await fs.promises.readFile(this.archivo,'utf-8')
        let productos = JSON.parse(contenido);
        return productos;
    }

    async deleteById(arraySinElProducto) {
        fs.writeFile(this.archivo,JSON.stringify(arraySinElProducto),(err) => {
            if (err) {
                console.log('Hubo un error al eliminar el producto');
            } else {
                console.log('Producto eliminado');
            }
        })
        return arraySinElProducto
    }

    async updateById(productoActualizado) {
        fs.writeFile(this.archivo,JSON.stringify(productoActualizado),(err) => {
            if (err) {
                console.log('Hubo un error al actualizar el producto');
            } else {
                console.log('Producto actualizado');
            }
        })
        return productoActualizado;
    }
}

export default Contenedor;