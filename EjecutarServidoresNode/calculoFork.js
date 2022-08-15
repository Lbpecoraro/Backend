import calculoPesado from './calculo.js';

process.on('message',(msj) => {
    let cantidad = parseInt(msj)
    let numbers = calculoPesado(cantidad)
    process.send(numbers)
})