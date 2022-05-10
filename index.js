const http = require('http');

const server = http.createServer((req, res) => {
    res.end("Programacion backend!");
});
server.listen(8080, () => {
    console.log("escuchando!");
})