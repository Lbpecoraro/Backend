//ACÁ CREO UN CONTENEDOR QUE VA A TENER MÉTODOS CON NOMBRES DISTINTOS, PERO QUE APLIQUEN LOS MÉTODOS DEL ContenedorArchivo.
//ESTE DAO VA A SER LLAMADO DESDE EL ROUTER PARA EJECUTARSE LUEGO EN EL SERVIDOR.
import express from 'express';
const app = express();
import Contenedor from '../../contenedores/ContenedorArchivo.js';
import config from '../../config.js'
const contenedorArchivo = new Contenedor(config.archivo.pathProductos);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

class ProductosDaoArchivo {
    constructor(archivo) {
        this.archivo = archivo;
    }

    static id = 0;
    static timestamp = Date.now();
    static codigo = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    async save(producto) {
        try {
            let json = '';
            let contenido = await contenedorArchivo.getAll()
            if (contenido === '') {
                console.log('No hay datos');
                if (producto.nombre == '' || producto.precio == '' || producto.foto == '' || producto.foto == undefined || producto.stock == '' || producto.descipcion == '') {
                    console.log('No se puede guardar el producto');
                } else {
                    producto.id = ProductosDaoArchivo.id;
                    producto.timestamp = ProductosDaoArchivo.timestamp;
                    producto.codigo = ProductosDaoArchivo.codigo;
                    json = JSON.stringify([producto]);
                    await contenedorArchivo.save(json);
                    ProductosDaoArchivo.id++;
                    ProductosDaoArchivo.timestamp = Date.now();
                    ProductosDaoArchivo.codigo = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
                }
            } else {
                contenido.forEach(prod => {
                    if (ProductosDaoArchivo.id <= prod.id) {
                        ProductosDaoArchivo.id++;
                    }
                    if (ProductosDaoArchivo.id == prod.id) {
                        ProductosDaoArchivo.id++;
                    }
                });
                for (let i = 0; i < contenido.length; i++) {
                    if (contenido[i].nombre === producto.nombre || contenido[i].foto === producto.foto) {
                        console.log('El producto ya existe');
                    } else if (producto.nombre == '' || producto.precio == '' || producto.foto == '' || producto.foto == undefined || producto.stock == '' || producto.descipcion == '') {
                        console.log('No se pudo cargar el producto, hay campos vacíos');
                    } else {
                        console.log(ProductosDaoArchivo.id);
                        producto.id = ProductosDaoArchivo.id;
                        producto.timestamp = ProductosDaoArchivo.timestamp;
                        producto.codigo = ProductosDaoArchivo.codigo;
                        json = JSON.stringify([...contenido,producto]);
                        //ACÁ EJECUTO EL SAVE DEL CONTENDOR
                        await contenedorArchivo.save(json);
                    }
                }
                ProductosDaoArchivo.id++;
                ProductosDaoArchivo.timestamp = Date.now();
                ProductosDaoArchivo.codigo = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
            }

        } catch (error) {
            console.log(error);
        }
        return producto;
    }


    async getById(id) {
        let producto = await contenedorArchivo.getById(id);
        return producto;
    }

    async getAll() {
        let productos = await contenedorArchivo.getAll()
        return productos;
    }

    async deleteById(id) {
        let contenido = await contenedorArchivo.getAll()
        let arraySinElProducto = contenido.filter(prod => prod.id !== id);
        let prod = await contenedorArchivo.deleteById(arraySinElProducto)
        console.log(prod);
    }

    async updateById(id,producto) {
        let contenido = await contenedorArchivo.getAll()
        let productoActualizado = contenido.map(prod => {
            if (prod.id === id) {
                prod.nombre = producto.nombre === '' || producto.nombre === undefined ? prod.nombre : producto.nombre;
                prod.precio = producto.precio === '' || producto.precio === undefined ? prod.precio : producto.precio;
                prod.foto = producto.foto === '' || producto.foto === undefined ? prod.foto : producto.foto;
                prod.stock = producto.stock === '' || producto.stock === undefined ? prod.stock : producto.stock;
                prod.descripcion = producto.descripcion === '' || producto.descripcion === undefined ? prod.descripcion : producto.descripcion;
            }
            return prod;
        })
        await contenedorArchivo.updateById(productoActualizado)
    }
}
export default ProductosDaoArchivo;