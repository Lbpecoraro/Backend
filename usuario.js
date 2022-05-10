class Usuario {
    constructor(nombre, apellido, libros, mascotas) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.libros = libros;
        this.mascotas = mascotas;

    }
    getFullName() {
        console.log(`${this.nombre} ${this.apellido}`);
    }
    addMascota(pichichu) {
        this.mascotas.push(pichichu);
    }
    countMascotas() {
        console.log(this.mascotas.length);
    }
    addBook(nombre, autor) {
        this.libros.push({
            nombre: nombre,
            autor: autor
        })
    }
    getBookNames() {
        console.log(this.libros.map(libro => libro.nombre));
    }

}
const usuario1 = new Usuario("Mulan", "Fa", [], []);
usuario1.getFullName();
usuario1.addMascota("Mushu");
usuario1.countMascotas();
usuario1.addBook("Como salvar China en 7 días", "Li Shang");
usuario1.addBook("Hombres en acción", "Yao");
usuario1.getBookNames();

class actor {
    constructor(name, lastName, movies, pet) {
        this.name = name;
        this.lastName = lastName;
        this.movies = movies;
        this.pet = pet;

    }
    getFullName() {
        console.log(`${this.name} ${this.lastName}`);
    }
    addPet(perro) {
        this.pet.push(perro);
    }
    countPet() {
        console.log(this.pet.length);
    }
    addMovie(name, director) {
        this.movies.push({
            name: name,
            director: director
        })
    }
    getMovieNames() {
        console.log(this.movies.map(movie => movie.name));
    }

}
const actor1 = new actor("Jonny", "Deep", [], []);
actor1.getFullName();
actor1.addPet("perro");
actor1.countPet();
actor1.addMovie("piratas del caribe", "A");
actor1.addMovie("el joven manos de tijera", "B");
actor1.getMovieNames();