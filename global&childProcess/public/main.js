const socket = io();

const schemaAuthor = new normalizr.schema.Entity('author',{ idAttribute: '_id' });
const schemaMessage = new normalizr.schema.Entity('message',{
    author: schemaAuthor
},{ idAttribute: '_id' });


const enviarMensaje = (e) => {
    const fyh = String(new Date().toDateString() + ' ' + new Date().toLocaleTimeString())
    const id = document.getElementById('id').value;
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const edad = document.getElementById('edad').value;
    const alias = document.getElementById('alias').value;
    const avatar = document.getElementById('avatar').value;
    const text = document.getElementById('text').value;

    const mensaje = { id,nombre,apellido,edad,alias,avatar,text,fyh };
    console.log(mensaje);
    socket.emit('new_message',mensaje);
    // Si no hacemos return false el formulario va a querer hacer un post a '/' y no queremos que lo haga
    return false;
}

const crearEtiquetasMensaje = (mensaje) => {
    const { id,avatar } = mensaje.author;
    return `
    <div>
        <strong style='color:blue'>${id}</strong>
        <p style='color:brown'>${mensaje.fyh}</p>
        <i style='color:green'>${mensaje.text}</i>
        <img style="width:3rem" src="${avatar}"></img>
    </div>
    `;
}

const agregarMensajes = (mensajes) => {
    if (mensajes !== '') {
        const mensajesFinal = mensajes.map(mensaje => crearEtiquetasMensaje(mensaje)).join(' ');
        document.getElementById('messages').innerHTML = mensajesFinal;
    }
}

socket.on('messages',(messages) => {
    console.log(messages);
    const desnormalizado = normalizr.denormalize(messages.result,[schemaMessage],messages.entities)
    // console.log(desnormalizado);
    agregarMensajes(desnormalizado)
});

const crearEtiquetasProductos = (producto) => {
    const { nombre,foto,precio } = producto;
    return `
    <tr>
        <td>${nombre}</td>
        <td>$ ${precio}</td>
        <td><img style="width: 5rem" src=${foto} alt=""></td>
    </tr>
    `;
}

const agregarProducto = (producto) => {
    if (producto !== '') {
        const productoFinal = producto.map(producto => crearEtiquetasProductos(producto)).join('<br>');
        document.getElementById('productsContainer').innerHTML = productoFinal;
    } else {
        document.getElementById('productsContainer').innerHTML = '<h2>No hay productos</h2>';
    }
}

socket.on('products',(products) => agregarProducto(products));

//Nuevo usuario

socket.on('user',(user) => {
    // console.log('User desde el main.js' + user);
    if (user !== false) {
        document.getElementsByTagName('h1')[0].innerHTML = `Bienvenido ${user}  <input type="button" value="Deslogear" id='logOut'>`;
        document.getElementById('logOut').addEventListener('click',() => {
            window.location.assign('/logOut');
        })
    } else {
        window.location.assign('/logOut');
    }
})

setInterval(() => {
    console.log('Intervalo');
    socket.emit('new_user',async () => {
    })
},5000);