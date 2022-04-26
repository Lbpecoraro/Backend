class Usuario{
constructor(nombre,apellido,libros,mascotas){
this.nombre=nombre;
this.apellido=apellido;
this.libros=libros;
this.mascotas=mascotas;

}
getFullName(){
    console.log( `${this.nombre} ${this.apellido}`);
}
addMascota(pichichu){
this.mascotas.push(pichichu);
}
countMascotas(){
    console.log(this.mascotas.length);
}
addBook(nombre,autor){
this.libros.push({nombre:nombre, autor:autor})
}
getBookNames(){
    console.log(this.libros.map(libro=>libro.nombre));
}

}
const usuario1=new Usuario ("Mulan", "Fa", [], []);
usuario1.getFullName();
usuario1.addMascota("Mushu");
usuario1.countMascotas();
usuario1.addBook("Como salvar China en 7 días", "Li Shang");
usuario1.addBook("Hombres en acción","Yao");
usuario1.getBookNames();

