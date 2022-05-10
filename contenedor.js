const fs = require("fs");

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
    }
    async getAll() {
        const contenido = await fs.promises.readFile(this.archivo, "utf-8");
        let productos = JSON.parse(contenido);
        console.log(productos);
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
}

const contenedor1 = new Contenedor("productos.txt");
// contenedor1.save({
//     title: "Los 7 maridos de Evelyn Hugo",
//     price: 2500,
//     thumbnail: "link1"
// })
// contenedor1.save({
//     title: "La reina roja",
//     price: 1400,
//     thumbnail: "link2"
// })
// contenedor1.save({
//     title: "Cazadores de sombras",
//     price: 2900,
//     thumbnail: "link3"
// })

// contenedor1.getById(0);
// contenedor1.getAll();
// contenedor1.deleteById(0);
// contenedor1.deleteAll();