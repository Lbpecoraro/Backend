import express,{ json,urlencoded } from 'express';
const app = express();
import productRouter from './router/productoRouter.js';
import carritoRouter from './router/carritoRouter.js';

app.use(json());
app.use(urlencoded({ extended: true }));

app.use('/productos',productRouter);
app.use('/carrito',carritoRouter);


//Me tira este error: Cannot set headers after they are sent to the client

// app.use((req,res,next) => {
//     res.status(400).send({
//         error: 'Ruta no encontrada'
//     });
// })

app.listen(8080,() => {
    console.log('Servidor iniciado');
})