const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MongoDB 
mongoose.connect('mongodb://localhost:27017/IEI_N3_C1', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
    console.log('Conectado a MongoDB');
});

// Definición de Esquemas y Modelos 

// 1. Esquema para la colección 'paises'
const paisSchema = new mongoose.Schema({
    nameES: String,
    nameEN: String,
    iso2: String,
    iso3: String,
    phoneCode: String
}, { collection: 'paises' });
const Pais = mongoose.model('Pais', paisSchema);

// 2. Esquema para la colección 'usuarios'
const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: [true, 'El nombre es obligatorio'] },
    rut: { type: String, required: [true, 'El RUT es obligatorio'], unique: true },
    correo: { type: String, required: [true, 'El correo es obligatorio'], unique: true },
    telefono: { type: String },
    fechaNacimiento: {
        type: Date,
        required: [true, 'La fecha de nacimiento es obligatoria'],
        validate: {
            validator: function(v) {
                return v instanceof Date && !isNaN(v) && v < new Date();
            },
            message: 'La fecha de nacimiento debe ser una fecha válida y anterior a la actual'
        }
    },
    nacionalidad: {
        type: String,
        required: [true, 'La nacionalidad es obligatoria'],
        uppercase: true,
        match: [/^[A-Z]{2}$/, 'El código de nacionalidad debe tener 2 letras mayúsculas (ISO-3166 Alpha-2)']
    },
    genero: {
        type: String,
        enum: {
            values: ['M', 'F', 'O'],
            message: 'El género debe ser M, F u O'
        }
    },
    direccion: {
        comuna: { type: String, required: [true, 'La comuna es obligatoria'] },
        calle: { type: String, required: [true, 'La calle es obligatoria'] },
        numero: { type: String },
        departamento: { type: String }
    },
    contrasena: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        validate: {
            validator: function(v) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])([A-Za-z\d$@$!%*?&]|[^ ]){8,15}$/.test(v);
            },
            message: 'La contraseña debe tener entre 8 y 15 caracteres, incluir mayúscula, minúscula, número y un carácter especial.'
        }
    },
    fechaRegistro: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    collection: 'usuarios',
    timestamps: false 
});

usuarioSchema.pre('save', async function(next) {
    if (!this.isModified('contrasena')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.contrasena = await bcrypt.hash(this.contrasena, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

// 3. Esquema para la colección 'canciones'
const cancionSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El usuario es obligatorio']
    },
    titulo: { type: String, required: [true, 'El título es obligatorio'] },
    artista: { type: String, required: [true, 'El artista es obligatorio'] },
    album: { type: String },
    genero: { type: String },
    duracion: { type: Number, min: [0, 'La duración no puede ser negativa'] },
    anio: {
        type: Number,
        min: [1800, 'El año no puede ser anterior a 1800'],
        max: [new Date().getFullYear(), 'El año no puede ser futuro']
    },
    idioma: { type: String },
    plataforma: { type: String },
    favorita: { type: Boolean, default: false }
}, { collection: 'canciones' });
const Cancion = mongoose.model('Cancion', cancionSchema);



// Endpoint para obtener países
app.get('/obtenerPaises', async (req, res) => {
    try {
        const paises = await Pais.find({}, 'nameES iso2');
        res.json(paises);
    } catch (error) {
        console.error('Error al obtener países:', error);
        res.status(500).json({ mensaje: 'Error al obtener los países' });
    }
});

// Endpoint para guardar un nuevo usuario
app.post('/guardarUsuario', async (req, res) => {
    try {
        const nuevoUsuario = new Usuario(req.body);
        await nuevoUsuario.save();
        res.status(201).json({ mensaje: 'Usuario guardado exitosamente' });
    } catch (error) {
        console.error('Error al guardar usuario:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ mensaje: 'Error de validación', errores: error.errors });
        }
        if (error.code === 11000) {
            const campo = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ mensaje: `El campo '${campo}' ya está en uso` });
        }
        res.status(500).json({ mensaje: 'Error al guardar el usuario' });
    }
});

// Endpoint para obtener todos los usuarios
app.get('/obtenerUsuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.aggregate([
            {
                $lookup: {
                    from: 'paises',
                    localField: 'nacionalidad',
                    foreignField: 'iso2',
                    as: 'paisOrigen'
                }
            },
            {
                $addFields: {
                    paisOrigen: { $arrayElemAt: ['$paisOrigen', 0] }
                }
            },
            {
                $project: {
                    contrasena: 0
                }
            }
        ]);
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ mensaje: 'Error al obtener los usuarios' });
    }
});

// Endpoint para guardar una nueva canción
app.post('/guardarCancion', async (req, res) => {
    try {
        const nuevaCancion = new Cancion(req.body);
        await nuevaCancion.save();
        res.status(201).json({ mensaje: 'Canción guardada exitosamente' });
    } catch (error) {
        console.error('Error al guardar canción:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ mensaje: 'Error de validación', errores: error.errors });
        }
        res.status(500).json({ mensaje: 'Error al guardar la canción' });
    }
});

// Endpoint para obtener todas las canciones con datos del usuario
app.get('/obtenerCanciones', async (req, res) => {
    try {
        const canciones = await Cancion.aggregate([
            {
                $lookup: {
                    from: 'usuarios',
                    localField: 'usuario',
                    foreignField: '_id',
                    as: 'usuario'
                }
            },
            {
                $addFields: {
                    usuario: { $arrayElemAt: ['$usuario', 0] }
                }
            },
            {
                $project: {
                    'usuario.contrasena': 0,
                    'usuario.__v': 0
                }
            }
        ]);
        res.json(canciones);
    } catch (error) {
        console.error('Error al obtener canciones:', error);
        res.status(500).json({ mensaje: 'Error al obtener las canciones' });
    }
});

// --- Iniciar el servidor ---
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});