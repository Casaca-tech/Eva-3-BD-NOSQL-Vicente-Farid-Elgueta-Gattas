window.onload = function () {
    cargarPaises();
};

function validarFormulario() {
    let inputNombre = document.getElementById('inputNombre');
    let inputRut = document.getElementById('inputRut');
    let inputEmail = document.getElementById('inputEmail');
    let inputTelefono = document.getElementById('inputTelefono');
    let inputFechaNacimiento = document.getElementById('inputFechaNacimiento');
    let inputNacionalidad = document.getElementById('selectNacionalidad');
    let inputGenero = document.getElementById('selectGenero');
    let inputComuna = document.getElementById('inputComuna');
    let inputCalle = document.getElementById('inputCalle');
    let inputContrasena = document.getElementById('password');
    let inputRepetirContrasena = document.getElementById('passwordRepetir');
    let formularioValido = true;


    if (!validarInput(inputNombre)) { formularioValido = false; }
    if (!validarRut(inputRut)) { formularioValido = false; }
    if (!validarEmail(inputEmail)) { formularioValido = false; }
    if (!validarInput(inputTelefono)) { inputTelefono.classList.remove('alerta'); /* Opcional */ }
    if (!validarFechaNacimiento(inputFechaNacimiento)) { formularioValido = false; }
    if (!validarSelect(inputNacionalidad)) { formularioValido = false; }
    if (inputGenero.value && !['M', 'F', 'O'].includes(inputGenero.value)) {
        inputGenero.classList.add('alerta');
        formularioValido = false;
    } else {
        inputGenero.classList.remove('alerta');
    }
    if (!validarInput(inputComuna)) { formularioValido = false; }
    if (!validarInput(inputCalle)) { formularioValido = false; }
    if (!validarContrasena(inputContrasena)) { formularioValido = false; }
    if (!validarInput(inputRepetirContrasena)) { formularioValido = false; }
    if (!validarRepetirContrasena(inputRepetirContrasena)) { formularioValido = false; }

    if (formularioValido) {
        const formulario = document.getElementById('formularioRegistro');
        const dataForm = new FormData(formulario);

        // el objeto 'direccion' a partir de los campos del formulario
        const direccion = {
            comuna: dataForm.get('comuna'),
            calle: dataForm.get('calle'),
            numero: dataForm.get('numero') || '',
            departamento: dataForm.get('departamento') || ''
        };

        // el objeto final con todos los datos
        const datos = {
            nombre: dataForm.get('nombre'),
            rut: dataForm.get('rut'),
            correo: dataForm.get('correo'),
            telefono: dataForm.get('telefono') || '',
            fechaNacimiento: dataForm.get('fechaNacimiento'), // Ya viene en formato YYYY-MM-DD
            nacionalidad: dataForm.get('nacionalidad'),
            genero: dataForm.get('genero') || 'O', // Si no se selecciona, enviamos 'O' o podemos omitirlo
            direccion: direccion,
            contrasena: dataForm.get('contrasena')
        };

        const enviarFormulario = async () => {
            try {
                const response = await fetch('http://localhost:3000/guardarUsuario', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datos)
                });

                const data = await response.json();

                if (!response.ok) {
                    let errorMsg = 'Error al guardar: ';
                    if (data.errores) {
                        // Mostrar errores de validación específicos
                        const errores = Object.values(data.errores).map(err => err.message).join(', ');
                        errorMsg += errores;
                    } else {
                        errorMsg += data.mensaje || 'Error desconocido';
                    }
                    alert(errorMsg);
                } else {
                    alert('Usuario registrado exitosamente!');
                    window.location.href = './index.html';
                }
            } catch (error) {
                console.error("Error de red:", error);
                alert('Error de conexión con el servidor.');
            }
        };
        enviarFormulario();
    } else {
        alert('Por favor, corrija los campos resaltados en rojo.');
    }
}

// funciones d validacion

function validarInput(input) {
    return input.value.trim() !== '' ? inputValido(input) : inputInvalido(input);
}

function validarSelect(input) {
    return input.value !== '' ? inputValido(input) : inputInvalido(input);
}

function validarFechaNacimiento(input) {
    if (!validarInput(input)) return false;
    const fecha = new Date(input.value);
    if (isNaN(fecha.getTime())) {
        return inputInvalido(input);
    }

    if (fecha >= new Date()) {
        alert('La fecha de nacimiento debe ser anterior a la fecha actual.');
        return inputInvalido(input);
    }
    return inputValido(input);
}

function validarEmail(input) {
    if (validarInput(input)) {
        const expresionEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return expresionEmail.test(input.value) ? inputValido(input) : inputInvalido(input);
    }
    return false;
}

function validarContrasena(input) {
    if (validarInput(input)) {
        const expresionContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])([A-Za-z\d$@$!%*?&]|[^ ]){8,15}$/;
        return expresionContrasena.test(input.value) ? inputValido(input) : inputInvalido(input);
    }
    return false;
}

function validarRepetirContrasena(input) {
    if (validarInput(input)) {
        let inputContrasena = document.getElementById('password');
        return input.value === inputContrasena.value ? inputValido(input) : inputInvalido(input);
    }
    return false;
}

function validarRut(inputRut) {
    if (validarInput(inputRut)) {
        let rutCompleto = inputRut.value.replaceAll('.', '');
        if (/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rutCompleto)) {
            const tmp = rutCompleto.split('-');
            const digv = tmp[1].toLowerCase();
            const rut = tmp[0];
            if (digitoVerificador(rut) != digv) {
                return inputInvalido(inputRut);
            }
            return inputValido(inputRut);
        } else {
            return inputInvalido(inputRut);
        }
    }
    return false;
}

function digitoVerificador(T) {
    let M = 0, S = 1;
    for (; T; T = Math.floor(T / 10))
        S = (S + T % 10 * (9 - M++ % 6)) % 11;
    return S ? S - 1 : 'k';
}

function inputInvalido(input) {
    input.classList.add('alerta');
    input.classList.add('is-invalid');
    return false;
}

function inputValido(input) {
    input.classList.remove('alerta');
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    return true;
}

async function cargarPaises() {
    try {
        const response = await fetch('http://localhost:3000/obtenerPaises');
        const paises = await response.json();
        const select = document.getElementById('selectNacionalidad');
        paises.forEach(pais => {
            const opcion = document.createElement('option');
            opcion.value = pais.iso2; // Guardamos el código ISO2
            opcion.textContent = `${pais.iso2} - ${pais.nameES}`; // Mostramos el nombre
            select.appendChild(opcion);
        });
    } catch (error) {
        console.log('Ha ocurrido un error al cargar los datos: ', error);
    }
}