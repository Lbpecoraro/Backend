const express = require("express");
const app = express();
const routerProductos = require("./routerProductos");

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use("/", routerProductos);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})


app.listen(8080, () => {
    console.log("escuchando el puerto 8080");
})