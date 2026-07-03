// canciones.js
use("IEI_N3_C1");

// Creamos la colección
db.createCollection("canciones");

// Buscamos usuarios por su RUT para obtener su ObjectId.
const usuarios = db.usuarios.find({}, { _id: 1, rut: 1 }).toArray();
const usuarioMap = {};
usuarios.forEach(u => {
    usuarioMap[u.rut] = u._id;
});

db.canciones.insertMany([
    {
        usuario: usuarioMap["12345678-5"],
        titulo: "Bohemian Rhapsody",
        artista: "Queen",
        album: "A Night at the Opera",
        genero: "Rock",
        duracion: 355, // se alamcena en segundos
        anio: 1975,
        idioma: "Inglés",
        plataforma: "Spotify",
        favorita: true
    },
    {
        usuario: usuarioMap["9876543-3"], 
        titulo: "Like a Rolling Stone",
        artista: "Bob Dylan",
        album: "Highway 61 Revisited",
        genero: "Folk Rock",
        duracion: 368,
        anio: 1965,
        idioma: "Inglés",
        plataforma: "YouTube Music",
        favorita: true
    },
    {
        usuario: usuarioMap["14567890-0"],
        titulo: "Stairway to Heaven",
        artista: "Led Zeppelin",
        album: "Led Zeppelin IV",
        genero: "Rock",
        duracion: 482,
        anio: 1971,
        idioma: "Inglés",
        plataforma: "Apple Music",
        favorita: false
    },
    {
        usuario: usuarioMap["16789012-7"],
        titulo: "Imagine",
        artista: "John Lennon",
        album: "Imagine",
        genero: "Rock",
        duracion: 183,
        anio: 1971,
        idioma: "Inglés",
        plataforma: "Spotify",
        favorita: true
    },
    {
        usuario: usuarioMap["17890123-7"],
        titulo: "Numb",
        artista: "Linkin Park",
        album: "Meteora",
        genero: "Nu Metal",
        duracion: 207,
        anio: 2003,
        idioma: "Inglés",
        plataforma: "Amazon Music",
        favorita: false
    },
    {
        usuario: usuarioMap["18901234-6"],
        titulo: "Rosa Pastel",
        artista: "Belanova",
        album: "Dulce Beat",
        genero: "Pop",
        duracion: 218,
        anio: 2005,
        idioma: "Español",
        plataforma: "Spotify",
        favorita: true
    }
]);

print("Canciones insertadas correctamente.");