window.onload = function () {
    obtenerUsuarios();
}

function obtenerUsuarios() {
    const enviarFormulario = async () => {
        try {
            const response = await fetch('http://localhost:3000/obtenerUsuarios');
            const usuarios = await response.json();

            console.log(usuarios);

            if ($.fn.DataTable.isDataTable('#usuarios')) {
                $('#usuarios').DataTable().destroy();
            }

            new DataTable('#usuarios', {
                data: usuarios,
                columns: [
                    { data: 'nombre' },
                    { data: 'rut' },
                    { data: 'correo' },
                    { data: 'telefono' },
                    { 
                        data: 'fechaNacimiento',
                        render: function (data, type, row) {
                            if (type === 'sort' || type === 'type') {
                                return data;
                            }
                            if (!data) return '';
                            let date = new Date(data);
                            return date.toLocaleDateString('es-CL', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                            });
                        }
                    },
                    { data: 'paisOrigen.nameES' },
                    { data: 'genero' },
                    { // Dirección (mostramos calle y comuna)
                       data: 'direccion',
                        render: function(data) {
                            if (!data) return '';
                            let dir = data.calle || '';
                            if (data.numero) dir += ` ${data.numero}`;
                            if (data.comuna) dir += `, ${data.comuna}`;
                            if (data.departamento) dir += `, ${data.departamento}`;
                            return dir;
                        }
                    },
                    { 
                        data: 'activo',
                        render: function(data) {
                            return data ? 'Sí' : 'No';
                        }
                    },
                    { data: 'fechaRegistro' } // Mostramos fecha de registro
                ],
                order: [[0, 'asc']],
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
                }
            });
        } catch (err) {
            console.log('Error al obtener los datos: ', err);
        }
    }
    enviarFormulario();
};