const express = require('express');
const app = express();
const productRouter = express.Router();
const carritoRouter = express.Router();
const fs = require('fs');
const multer = require('multer');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const middlewareAutenticacion = (req,res,next) => {
    req.user = {
        fullName: "Matias Aguilera",
        isAdmin: true
    };
    next();
}
const middlewareAutorizacion = (req,res,next) => {
    if (req.user.isAdmin) {
        next();
    } else {
        res.status(401).send("No estas autorizado");
    }
}

// PRODUCT ROUTER
class Contenedor {
    constructor(archivo) {
        this.archivo = archivo;
    }

    static id = 0;
    static timestamp = Date.now();
    static codigo = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    async save(producto) {
        try {
            let json = '';
            let contenido = await fs.promises.readFile(this.archivo,'utf-8');
            if (contenido === '') {
                console.log('No hay datos');
                if (producto.nombre == '' || producto.precio == '' || producto.foto == '' || producto.foto == undefined || producto.stock == '' || producto.descipcion == '') {
                    console.log('No se puede guardar el producto');
                } else {
                    producto.id = Contenedor.id;
                    producto.timestamp = Contenedor.timestamp;
                    producto.codigo = Contenedor.codigo;
                    json = JSON.stringify([producto]);
                    await fs.promises.writeFile(this.archivo,json,(err) => {
                        if (err) {
                            console.log('Hubo un error al cargar el producto');
                        } else {
                            console.log(producto.id);
                        }
                    })
                    Contenedor.id++;
                    Contenedor.timestamp = Date.now();
                    Contenedor.codigo = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
                }
            } else {
                let productos = JSON.parse(contenido);
                productos.forEach(prod => {
                    if (Contenedor.id <= prod.id) {
                        Contenedor.id++;
                    }
                    if (Contenedor.id == prod.id) {
                        Contenedor.id++;
                    }
                });
                for (let i = 0; i < productos.length; i++) {
                    if (productos[i].nombre === producto.nombre || productos[i].foto === producto.foto) {
                        console.log('El producto ya existe');
                    } else if (producto.nombre == '' || producto.precio == '' || producto.foto == '' || producto.foto == undefined || producto.stock == '' || producto.descipcion == '') {
                        console.log('No se pudo cargar el producto, hay campos vacíos');
                    } else {
                        producto.id = Contenedor.id;
                        producto.timestamp = Contenedor.timestamp;
                        producto.codigo = Contenedor.codigo;
                        json = JSON.stringify([...productos,producto]);
                        await fs.promises.writeFile(this.archivo,json,(err) => {
                            if (err) {
                                console.log('Hubo un error al cargar el producto');
                            } else {
                                console.log(producto.id);
                            }
                        })
                    }
                }
                Contenedor.id++;
                Contenedor.timestamp = Date.now();
                Contenedor.codigo = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
            }

        } catch (error) {
            console.log(error);
        }
        return producto;
    }


    async getById(id) {
        let contenido = await fs.promises.readFile(this.archivo,'utf-8')
        let productos = JSON.parse(contenido);
        let producto = productos.find(producto => producto.id === id);
        if (producto) {
            console.log(producto);
        } else {
            console.log('No existe el producto');
        }
        return producto;
    }

    async getAll() {
        let contenido = await fs.promises.readFile(this.archivo,'utf-8')
        let productos = JSON.parse(contenido);
        console.log(productos);
        return productos;
    }

    async deleteById(id) {
        let contenido = await fs.promises.readFile(this.archivo,'utf-8')
        let productos = JSON.parse(contenido);
        let arraySinElProducto = productos.filter(prod => prod.id !== id);
        fs.writeFile(this.archivo,JSON.stringify(arraySinElProducto),(err) => {
            if (err) {
                console.log('Hubo un error al eliminar el producto');
            } else {
                console.log('Producto eliminado');
            }
        })
    }

    async updateById(id,producto) {
        let contenido = await fs.promises.readFile(this.archivo,'utf-8')
        let productos = JSON.parse(contenido);
        let productoActualizado = productos.map(prod => {
            if (prod.id === id) {
                console.log(producto.foto);
                prod.nombre = producto.nombre === '' || producto.nombre === undefined ? prod.nombre : producto.nombre;
                prod.precio = producto.precio === '' || producto.precio === undefined ? prod.precio : producto.precio;
                prod.foto = producto.foto === '' || producto.foto === undefined ? prod.foto : producto.foto;
                prod.stock = producto.stock === '' || producto.stock === undefined ? prod.stock : producto.stock;
                prod.foto = producto.foto === '' || producto.foto === undefined ? prod.foto : producto.foto;
                prod.descripcion = producto.descripcion === '' || producto.descripcion === undefined ? prod.descripcion : producto.descripcion;
            }
            return prod;
        })
        fs.writeFile(this.archivo,JSON.stringify(productoActualizado),(err) => {
            if (err) {
                console.log('Hubo un error al actualizar el producto');
            } else {
                console.log('Producto actualizado');
            }
        })
    }
}

let cont1 = new Contenedor('./productos.txt');

// Obtener todos los productos
productRouter.get('/',middlewareAutenticacion,async (req,res) => {
    let allProducts = await cont1.getAll();
    res.send(allProducts);
})

// Obtener 1 producto
productRouter.get('/:id',middlewareAutenticacion,async (req,res) => {
    console.log(req.params.id);
    let prodSelected = await cont1.getById(parseInt(req.params.id));

    if (prodSelected) {
        res.send(prodSelected);
    } else {
        res.status(404).send({ error: 'Producto no encontrado' })
    }
})

//Creo un producto
const storage = multer({ destination: './productos.txt' })
const uploadProduct = storage.fields([{ nombre: 'nombre',precio: 'precio',foto: 'foto' }]);
productRouter.post('/',uploadProduct,middlewareAutenticacion,middlewareAutorizacion,async (req,res,next) => {
    let prod = await cont1.save(req.body);
    if (prod.nombre === '' || prod.precio === '' || prod.foto === '' || prod.foto === '' || prod.stock === '' || prod.descripcion === '') {
        res.status(400).send({ error: 'El producto no se pudo cargar, hay campos vacios' });
    } else {
        res.send(req.body);
    }
    next();
})

//Actualizo un producto
productRouter.put('/:id',middlewareAutenticacion,middlewareAutorizacion,(req,res) => {
    cont1.updateById(parseInt(req.params.id),req.body);
    res.send(req.body);
})

//Elimino un producto
productRouter.delete('/:id',middlewareAutenticacion,middlewareAutorizacion,async (req,res) => {
    let prodDeleted = await cont1.deleteById(parseInt(req.params.id));
    res.send(prodDeleted);
})


// CARRITO ROUTER

class Carrito {
    constructor(archivo) {
        this.archivo = archivo;
    }

    static id = 0;
    static timestamp = Date.now();

    async createCarrito() {
        Carrito.timestamp = Date.now();
        let contenido = await fs.promises.readFile(this.archivo,'utf-8');
        let carritos = JSON.parse(contenido);
        carritos.forEach(prod => {
            if (Carrito.id <= prod.id) {
                Carrito.id++;
            }
            if (Carrito.id == prod.id) {
                Carrito.id++;
            }
        });
        let carrito = {
            id: Carrito.id,
            timestamp: Carrito.timestamp,
            productos: []
        }
        let json = '';
        json = JSON.stringify([...carritos,carrito]);
        await fs.promises.writeFile(this.archivo,json,(err) => {
            if (err) {
                console.log('Hubo un error al cargar el carrito');
            } else {
                console.log(carrito.id);
            }
        })
        return carrito;
    }

    async saveProductInCart(id,product) {
        let json = '';
        let contenido = await fs.promises.readFile(this.archivo,'utf-8');
        let carritos = JSON.parse(contenido);
        try {
            let carritoElegido = carritos.find(cart => cart.id === id);
            // let producto = JSON.stringify(product)
            carritoElegido.productos.push(product);
            console.log(carritos);
            json = JSON.stringify(carritos);
            await fs.promises.writeFile(this.archivo,json,(err) => {
                if (err) {
                    console.log('Hubo un error al cargar el producto');
                } else {
                    console.log(producto.id);
                }
            })



        } catch (error) {
            console.log(error);
        }
        return carritos;
    }

    async getById(id) {
        let contenido = await fs.promises.readFile(this.archivo,'utf-8')
        let carritos = JSON.parse(contenido);
        let carrito = carritos.find(cart => cart.id === id);
        if (carrito) {
            console.log(carrito);
        } else {
            console.log('No existe el carrito');
        }
        return carrito;
    }

    async getAll() {
        let contenido = await fs.promises.readFile(this.archivo,'utf-8')
        let productos = JSON.parse(contenido);
        console.log(productos);
        return productos;
    }

    async deleteCart(id) {
        let contenido = await fs.promises.readFile(this.archivo,'utf-8')
        let carritos = JSON.parse(contenido);
        let arraySinElCarrito = await carritos.filter(cart => cart.id !== parseInt(id));
        fs.writeFile(this.archivo,JSON.stringify(arraySinElCarrito),(err) => {
            if (err) {
                console.log('Hubo un error al eliminar el producto');
            } else {
                console.log('Carrito eliminado');
            }
        })
    }

    async deleteProdInCart(id,prodId) {
        let contenido = await fs.promises.readFile(this.archivo,'utf-8')
        let carritos = JSON.parse(contenido);
        let carrito = await carritos.find(cart => cart.id === parseInt(id));
        let carritoSinProd = await carrito.productos.filter(prod => prod.id !== parseInt(prodId));
        carrito.productos = carritoSinProd;
        fs.writeFile(this.archivo,JSON.stringify(carritos),(err) => {
            if (err) {
                console.log('Hubo un error al eliminar el producto');
            } else {
                console.log('Carrito eliminado');
            }
        })
    }

}

const carrito1 = new Carrito('./carrito.txt');

//Creo todos los carrito que quiera con hacer un post a /carrito
carritoRouter.post('/',async (req,res) => {
    let newCarrito = await carrito1.createCarrito();
    res.send(newCarrito);
})

//Elimino el carrito que quiero haciendo /carrito/id
carritoRouter.delete('/:id',async (req,res) => {
    let id = req.params.id;
    await carrito1.deleteCart(id);
    res.send('Carrito eliminado');
})

//Obtengo todos los productos dentro del carrito con /carrito/id/productos
carritoRouter.get('/:id/productos',async (req,res) => {
    let id = req.params.id;
    let carrito = await carrito1.getById(parseInt(id));
    res.send(carrito.productos);
})

//Ingreso un producto nuevo en el carrito con /carrito/id/productos
carritoRouter.post('/:id/productos',async (req,res) => {
    let id = req.params.id;
    let carrito = await carrito1.saveProductInCart(parseInt(id),req.body);
    res.send(carrito);
})

//Elimino el producto que se encuentro dentro de un carrito con /carrito/id/productos/id_prod
carritoRouter.delete('/:id/productos/:id_prod',async (req,res) => {
    let id = req.params.id;
    let prodId = req.params.id_prod;
    await carrito1.deleteProdInCart(id,prodId);
    res.send('Producto eliminado');
})

module.exports = { productRouter,carritoRouter }