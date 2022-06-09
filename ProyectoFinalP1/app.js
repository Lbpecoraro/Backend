const express = require('express');
const app = express();
const { productRouter,carritoRouter } = require('./routerController');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/productos',productRouter);
app.use('/carrito',carritoRouter);

app.use((req,res,next) => {
    res.status(404).send('Ruta no encontrada');
})

app.listen(8080,() => {
    console.log('Servidor iniciado');
})