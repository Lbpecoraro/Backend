const express = require("express");
const app = express();
const fs = require("fs");

class Contenedor {
    constructor(archivo) {
        this.archivo = archivo;
    }

    static id = 0;

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
}
const contenedor1 = new Contenedor("productos.txt");

app.get("/productos", async (request, response, next) => {
    let productitos = await contenedor1.getAll();
    response.send(productitos);
})

app.get("/productoRandom", async (request, response, next) => {
    let prodId = Math.floor(Math.random() * 3);
    let productito = await contenedor1.getById(prodId);
    response.send(productito);
})

app.listen(8080, () => {
    console.log("escuchando en el puerto 8080");
})