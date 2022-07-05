import Contenedor from '../../contenedores/ContenedorFirebase.js';
import config from '../../config.js';
const contenedorFirebase = new Contenedor(config.firebase.collectionProducts);


class ProductosDaoFirebase {
    constructor(archivo) {
        this.archivo = archivo;
    }

    static id = 0;
    static timestamp = Date.now();
    static codigo = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    async save(producto) {
        try {
            let contenido = await contenedorFirebase.getAll()
            if (contenido.length === 0) {
                console.log('No hay datos');
                if (producto.nombre == '' || producto.precio == '' || producto.foto == '' || producto.foto == undefined || producto.stock == '' || producto.descipcion == '') {
                    console.log('No se puede guardar el producto');
                } else {
                    producto.id = ProductosDaoFirebase.id;
                    producto.timestamp = ProductosDaoFirebase.timestamp;
                    producto.codigo = ProductosDaoFirebase.codigo;
                    await contenedorFirebase.save(producto);
                    ProductosDaoFirebase.id++;
                    ProductosDaoFirebase.timestamp = Date.now();
                    ProductosDaoFirebase.codigo = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
                }
            } else {
                contenido.forEach(prod => {
                    if (ProductosDaoFirebase.id <= prod.id) {
                        ProductosDaoFirebase.id++;
                    }
                    if (ProductosDaoFirebase.id == prod.id) {
                        ProductosDaoFirebase.id++;
                    }
                });
                for (let i = 0; i < contenido.length; i++) {
                    if (contenido[i].nombre === producto.nombre || contenido[i].foto === producto.foto) {
                        console.log('El producto ya existe');
                    } else if (producto.nombre == '' || producto.precio == '' || producto.foto == '' || producto.foto == undefined || producto.stock == '' || producto.descipcion == '') {
                        console.log('No se pudo cargar el producto, hay campos vacíos');
                    } else {
                        console.log(ProductosDaoFirebase.id);
                        producto.id = ProductosDaoFirebase.id;
                        producto.timestamp = ProductosDaoFirebase.timestamp;
                        producto.codigo = ProductosDaoFirebase.codigo;
                        await contenedorFirebase.save(producto);
                    }
                }
                ProductosDaoFirebase.id++;
                ProductosDaoFirebase.timestamp = Date.now();
                ProductosDaoFirebase.codigo = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
            }

        } catch (error) {
            console.log(error);
        }
        return producto;
    }


    async getById(id) {
        let producto = await contenedorFirebase.getById(id);
        return producto;
    }

    async getAll() {
        let productos = await contenedorFirebase.getAll()
        return productos;
    }

    async deleteById(id) {
        await contenedorFirebase.deleteById(id)
    }

    async updateById(id,producto) {
        let productoDb = await contenedorFirebase.getById(id);
        console.log('pasé');
        productoDb.nombre = producto.nombre === '' || producto.nombre === undefined ? prod.nombre : producto.nombre;
        productoDb.precio = producto.precio === '' || producto.precio === undefined ? prod.precio : producto.precio;
        productoDb.foto = producto.foto === '' || producto.foto === undefined ? prod.foto : producto.foto;
        productoDb.stock = producto.stock === '' || producto.stock === undefined ? prod.stock : producto.stock;
        productoDb.descripcion = producto.descripcion === '' || producto.descripcion === undefined ? prod.descripcion : producto.descripcion;

        await contenedorFirebase.updateById(productoDb)
    }
}
export default ProductosDaoFirebase;