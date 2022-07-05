export default {
    archivo: {
        pathCarrito: './carrito.txt',
        pathProductos: './productos.txt',
    },
    mongodb: {
        mongo: "mongodb+srv://lbpecoraro:lucia3600@cluster0.pi3nb2l.mongodb.net/?retryWrites=true&w=majority",
        db: "ecommerce",
        collectionProducts: "productos",
        collectionCarrito: "carrito",
    },
    firebase: {
        url: "https://backend-53aec.firebaseio.com",
        collectionProducts: "productos",
        collectionCarrito: "carrito",
    }
}