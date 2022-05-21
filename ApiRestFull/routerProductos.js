const express = require("express");
const app = express();
const routerProductos = express.Router();
const fs = require("fs");
const multer = require("multer");

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

class Contenedor {
    constructor(archivo) {
        this.archivo = archivo;
    }

    static id = 0;

    async save(producto) {
        try {
            let json = '';
            let contenido = await fs.promises.readFile(this.archivo, 'utf-8');
            Contenedor.id = contenido === '' ? Contenedor.id : JSON.parse(contenido).length;
            if (contenido === '') {
                console.log('no hay datos');
                producto.id = Contenedor.id;
                json = JSON.stringify([producto]);
                await fs.promises.writeFile(this.archivo, json, (error) => {
                    if (error) {
                        console.log('hay un error');
                    } else {
                        console.log('creado con éxito');
                    }
                })
                Contenedor.id++;
            } else {
                let productos = JSON.parse(contenido);
                for (let i = 0; i < productos.length; i++) {
                    if (productos[i].title === producto.title || productos[i].thumbnail === producto.thumbnail) {
                        console.log("El producto ya fue creado");
                    } else {
                        producto.id = Contenedor.id;
                        json = JSON.stringify([...productos, producto]);
                        await fs.promises.writeFile(this.archivo, json, (error) => {
                            if (error) {
                                console.log("hay un error");
                            } else {
                                console.log("creado con éxito");
                            }
                        })
                    }

                }
                Contenedor.id++;
            }

        } catch (error) {
            console.log(error);
        }
        return producto;
    }

    async getById(id) {
        const contenido = await fs.promises.readFile(this.archivo, "utf-8");
        let productos = JSON.parse(contenido);
        let producto = productos.find(prod => prod.id === id);
        if (producto) {
            console.log(producto);
        } else {
            console.log("no existe el producto");
        }
        return producto;
    }
    async getAll() {
        const contenido = await fs.promises.readFile(this.archivo, "utf-8");
        let productos = JSON.parse(contenido);
        console.log(productos);
        return productos;
    }

    async deleteById(id) {
        const contenido = await fs.promises.readFile(this.archivo, "utf-8");
        let productos = JSON.parse(contenido);
        let arraySinProd = productos.filter(prod => prod.id !== id);
        fs.writeFile(this.archivo, JSON.stringify(arraySinProd), (error) => {
            if (error) {
                console.log("error");
            } else {
                console.log("Se borró el producto");
            }
        });
    }
    async deleteAll() {
        await fs.promises.writeFile(this.archivo, "[]", (error) => {
            if (error) {
                console.log("error");
            } else {
                console.log("Se borró el producto");
            }
        });
    }
    async updateById(id, producto) {
        let contenido = await fs.promises.readFile(this.archivo, 'utf-8')
        let productos = JSON.parse(contenido);
        let productoActualizado = productos.map(prod => {
            if (prod.id === id) {
                console.log(producto.thumbnail);
                prod.title = producto.title === '' || producto.title === undefined ? prod.title : producto.title;
                prod.price = producto.price === '' || producto.price === undefined ? prod.price : producto.price;
                prod.thumbnail = producto.thumbnail === '' || producto.thumbnail === undefined ? prod.thumbnail : producto.thumbnail;
            }
            return prod;
        })
        fs.writeFile(this.archivo, JSON.stringify(productoActualizado), (err) => {
            if (err) {
                console.log('Hubo un error al actualizar el producto');
            } else {
                console.log('Producto actualizado');
            }
        })
    }

}

let contenedorcito = new Contenedor("ApiRestFull/productos.txt");

routerProductos.get("/api/productos", async (req, res) => {
    let todosLosProductos = await contenedorcito.getAll();
    res.send(todosLosProductos);
})

routerProductos.get("/api/productos/:id", async (req, res) => {
    let producto = await contenedorcito.getById(parseInt(req.params.id));
    if (producto) {
        res.send(producto);
    } else {
        res.status(400).send({
            error: "no encontramos el producto"
        })
    }
})

const storage = multer({
    destination: "ApiRestFull/productos.txt"
})

const uploadProducts = storage.fields([{
    tittle: "tittle",
    thumbnail: "thumbnail",
    price: "price"
}])

routerProductos.post("/api/productos", uploadProducts, async (req, res, next) => {
    let prod = await contenedorcito.save(req.body);
    console.log(prod);
    if (prod.tittle === "" || prod.price === "" || prod.thumbnail === "") {
        res.status(400).send({
            error: "no pudimos cargar el producto por que aún hay campos vacios"
        })
    } else {
        res.send(req.body);
    }
    next()
})

routerProductos.put("/api/productos/:id", async (req, res) => {
    contenedorcito.updateById(parseInt(req.params.id), req.body);
    res.send(req.body);
})

routerProductos.delete("/api/productos/:id", async (req, res) => {
    let prodEliminado = await contenedorcito.deleteById(parseInt(req.params.id));
    res.send(prodEliminado);
})

module.exports = routerProductos;