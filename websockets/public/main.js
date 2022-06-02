const socket = io();

const enviarMensaje = ()=>{
    const autor = document.getElementById('autor').value;
    const text = document.getElementById('text').value;
    const fyh=String(new Date().toDateString()+' '+ new Date().toLocaleTimeString());
    const mensaje = {autor,text,fyh};
    socket.emit('new_message', mensaje);
    return false;
}

const crearEtiquetasMensaje = (mensaje) =>{
    const {autor,text,fyh} =mensaje;
    return`
    <div>
        <strong style='color:blue'>${autor}</strong>
        <p style='color:brown'>${fyh}</p>
        <i style='color:green'>${text}</i>
    </div>
    `;
}

const agregarMensajes= (mensajes)=>{
    if(mensajes !== ''){
        const mensajesFinal = mensajes.map(mensaje => crearEtiquetasMensaje(mensaje)).join(' ');
        document.getElementById('messages').innerHTML=mensajesFinal;
    }
}

socket.on('messages',(messages)=>agregarMensajes(messages));

//productos

const enviarProducto = ()=>{
    let title = document.getElementById('title').value;
    let price = document.getElementById('price').value;
    let thumbnail=document.getElementById('thumbnail').value;
    const producto = {title,price,thumbnail};
    socket.emit('new_products', producto);
    title='';
    price='';
    thumbnail='';
    return false;
}

const crearEtiquetasProducto = (producto) =>{
    const {title,price,thumbnail} =producto;
    return`
    <tr>
        <td>${title}</td>
        <td>$ ${price}</td>
        <td><img src=${thumbnail} alt="" style="width:50px; height:50px"></td>
    </tr>
    `;
}

const agregarProductos= (products)=>{
    if(products !== ''){
        const productoFinal = products.map(producto => crearEtiquetasProducto(producto)).join('<br>');
        console.log(document.getElementById('productsContainer'));
        document.getElementById('productsContainer').innerHTML = productoFinal;
    }else{
        document.getElementById('productsContainer').innerHTML = "<h2>No hay productos</h2>";

    }
}

socket.on('products',(products)=>agregarProductos(products));

