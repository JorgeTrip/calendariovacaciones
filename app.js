// ===========================
// ESTADO DE LA APLICACIÓN
// ===========================

let empleados = [];
let vacaciones = [];
let editandoEmpleadoId = null;
let bloqueActual = null;

// ===========================
// UTILIDADES
// ===========================

function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function obtenerNombreCompleto(empleado) {
    return `${empleado.nombre} ${empleado.apellido}`;
}

// ===========================
// PERSISTENCIA DE DATOS
// ===========================

function cargarDatos() {
    const datosGuardados = localStorage.getItem('empleados');
    if (datosGuardados) {
        empleados = JSON.parse(datosGuardados);
    }

    const vacacionesGuardadas = localStorage.getItem('vacaciones');
    if (vacacionesGuardadas) {
        vacaciones = JSON.parse(vacacionesGuardadas);
    }

    // Cargar preferencia de modo oscuro
    const modoOscuro = localStorage.getItem('modoOscuro');
    if (modoOscuro === 'true') {
        document.body.classList.add('dark-mode');
        actualizarIconoTema();
    }
}

function guardarEmpleados() {
    localStorage.setItem('empleados', JSON.stringify(empleados));
}

function guardarVacaciones() {
    localStorage.setItem('vacaciones', JSON.stringify(vacaciones));
}

// ===========================
// MODO OSCURO
// ===========================

function inicializarModoOscuro() {
    const btnModoOscuro = document.getElementById('btnModoOscuro');

    btnModoOscuro.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const esModoOscuro = document.body.classList.contains('dark-mode');
        localStorage.setItem('modoOscuro', esModoOscuro);
        actualizarIconoTema();
    });
}

function actualizarIconoTema() {
    const iconoTema = document.querySelector('.icon-theme');
    const esModoOscuro = document.body.classList.contains('dark-mode');
    iconoTema.textContent = esModoOscuro ? '☀️' : '🌙';
}

// ===========================
// NAVEGACIÓN ENTRE MÓDULOS
// ===========================

function inicializarNavegacion() {
    const btnEmpleados = document.getElementById('btnEmpleados');
    const btnCalendario = document.getElementById('btnCalendario');
    const moduloEmpleados = document.getElementById('moduloEmpleados');
    const moduloCalendario = document.getElementById('moduloCalendario');

    btnEmpleados.addEventListener('click', () => {
        btnEmpleados.classList.add('active');
        btnCalendario.classList.remove('active');
        moduloEmpleados.classList.add('active');
        moduloCalendario.classList.remove('active');
    });

    btnCalendario.addEventListener('click', () => {
        btnCalendario.classList.add('active');
        btnEmpleados.classList.remove('active');
        moduloCalendario.classList.add('active');
        moduloEmpleados.classList.remove('active');
        actualizarSelectEmpleados();
    });
}

// ===========================
// MÓDULO DE EMPLEADOS
// ===========================

function inicializarModuloEmpleados() {
    const form = document.getElementById('formEmpleado');
    const btnCancelar = document.getElementById('btnCancelar');
    const inputColor = document.getElementById('color');
    const colorPreview = document.getElementById('colorPreview');
    const colorValue = document.getElementById('colorValue');

    // Actualizar previsualización de color
    inputColor.addEventListener('input', (e) => {
        const color = e.target.value;
        colorPreview.style.background = color;
        colorValue.textContent = color.toUpperCase();
    });

    // Inicializar previsualización
    colorPreview.style.background = inputColor.value;
    colorValue.textContent = inputColor.value.toUpperCase();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        guardarEmpleado();
    });

    btnCancelar.addEventListener('click', () => {
        limpiarFormulario();
    });

    renderizarListaEmpleados();
}

function guardarEmpleado() {
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const departamento = document.getElementById('departamento').value.trim();
    const color = document.getElementById('color').value;

    if (editandoEmpleadoId) {
        // Editar empleado existente
        const empleado = empleados.find(e => e.id === editandoEmpleadoId);
        if (empleado) {
            empleado.nombre = nombre;
            empleado.apellido = apellido;
            empleado.departamento = departamento;
            empleado.color = color;
        }
        editandoEmpleadoId = null;
    } else {
        // Crear nuevo empleado
        const nuevoEmpleado = {
            id: generarId(),
            nombre,
            apellido,
            departamento,
            color
        };
        empleados.push(nuevoEmpleado);
    }

    guardarEmpleados();
    limpiarFormulario();
    renderizarListaEmpleados();
}

function editarEmpleado(id) {
    const empleado = empleados.find(e => e.id === id);
    if (!empleado) return;

    document.getElementById('empleadoId').value = empleado.id;
    document.getElementById('nombre').value = empleado.nombre;
    document.getElementById('apellido').value = empleado.apellido;
    document.getElementById('departamento').value = empleado.departamento;
    document.getElementById('color').value = empleado.color;

    // Actualizar previsualización de color
    document.getElementById('colorPreview').style.background = empleado.color;
    document.getElementById('colorValue').textContent = empleado.color.toUpperCase();

    editandoEmpleadoId = id;

    // Scroll al formulario
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
}

function eliminarEmpleado(id) {
    if (!confirm('¿Está seguro de eliminar este empleado?')) return;

    empleados = empleados.filter(e => e.id !== id);

    // También eliminar las vacaciones asociadas
    vacaciones = vacaciones.filter(v => v.empleadoId !== id);
    guardarVacaciones();

    guardarEmpleados();
    renderizarListaEmpleados();
}

function limpiarFormulario() {
    document.getElementById('formEmpleado').reset();
    document.getElementById('empleadoId').value = '';
    const colorInicial = '#3498db';
    document.getElementById('color').value = colorInicial;
    document.getElementById('colorPreview').style.background = colorInicial;
    document.getElementById('colorValue').textContent = colorInicial.toUpperCase();
    editandoEmpleadoId = null;
}

function renderizarListaEmpleados() {
    const lista = document.getElementById('listaEmpleados');

    if (empleados.length === 0) {
        lista.innerHTML = '<div class="empty-message">No hay empleados registrados</div>';
        return;
    }

    lista.innerHTML = empleados.map(empleado => `
        <div class="empleado-card">
            <div class="empleado-info">
                <div class="empleado-color" style="background-color: ${empleado.color}"></div>
                <div class="empleado-datos">
                    <h4>${obtenerNombreCompleto(empleado)}</h4>
                    <p>${empleado.departamento || 'Sin departamento'}</p>
                </div>
            </div>
            <div class="empleado-acciones">
                <button class="btn btn-edit" onclick="editarEmpleado('${empleado.id}')">Editar</button>
                <button class="btn btn-danger" onclick="eliminarEmpleado('${empleado.id}')">Eliminar</button>
            </div>
        </div>
    `).join('');
}

// ===========================
// MÓDULO DE CALENDARIO
// ===========================

function inicializarModuloCalendario() {
    // Inicializar selector de años
    const selectAnio = document.getElementById('selectAnio');
    const anioActual = new Date().getFullYear();
    for (let i = anioActual - 1; i <= anioActual + 3; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i === anioActual) option.selected = true;
        selectAnio.appendChild(option);
    }

    // Botón para mostrar calendario
    document.getElementById('btnMostrarCalendario').addEventListener('click', mostrarCalendario);

    // Botón para crear bloque de vacaciones
    document.getElementById('btnCrearBloque').addEventListener('click', crearBloqueVacaciones);
}

function actualizarSelectEmpleados() {
    const select = document.getElementById('selectEmpleado');
    select.innerHTML = '<option value="">-- Seleccione un empleado --</option>';

    empleados.forEach(empleado => {
        const option = document.createElement('option');
        option.value = empleado.id;
        option.textContent = obtenerNombreCompleto(empleado);
        select.appendChild(option);
    });
}

function mostrarCalendario() {
    const checkboxesMeses = document.querySelectorAll('input[name="mes"]:checked');
    const selectAnio = document.getElementById('selectAnio');
    const container = document.getElementById('calendarioContainer');

    const mesesSeleccionados = Array.from(checkboxesMeses).map(cb => parseInt(cb.value));
    const anio = parseInt(selectAnio.value);

    if (mesesSeleccionados.length === 0) {
        alert('Por favor, seleccione al menos un mes');
        return;
    }

    // Ordenar meses
    mesesSeleccionados.sort((a, b) => a - b);

    container.innerHTML = '<div class="calendarios-grid"></div>';
    const grid = container.querySelector('.calendarios-grid');

    mesesSeleccionados.forEach(mes => {
        const calendarioMes = crearCalendarioMes(anio, mes);
        grid.appendChild(calendarioMes);
    });

    // Renderizar bloques de vacaciones existentes
    renderizarBloquesVacaciones();
}

function crearCalendarioMes(anio, mes) {
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const mesDiv = document.createElement('div');
    mesDiv.className = 'mes-calendario';
    mesDiv.dataset.anio = anio;
    mesDiv.dataset.mes = mes;

    let html = `
        <div class="mes-header">${nombresMeses[mes]} ${anio}</div>
        <div class="dias-semana">
            ${nombresDias.map(dia => `<div class="dia-semana">${dia}</div>`).join('')}
        </div>
        <div class="dias-grid">
    `;

    // Días del mes anterior (relleno)
    const mesAnterior = mes === 0 ? 11 : mes - 1;
    const anioMesAnterior = mes === 0 ? anio - 1 : anio;
    const diasMesAnterior = new Date(anio, mes, 0).getDate();

    for (let i = primerDiaSemana - 1; i >= 0; i--) {
        const dia = diasMesAnterior - i;
        html += `<div class="dia-cell otro-mes" data-fecha="${anioMesAnterior}-${(mesAnterior + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}">${dia}</div>`;
    }

    // Días del mes actual
    const hoy = new Date();
    for (let dia = 1; dia <= diasEnMes; dia++) {
        const fecha = new Date(anio, mes, dia);
        const fechaStr = `${anio}-${(mes + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
        const esHoy = fecha.toDateString() === hoy.toDateString();

        html += `<div class="dia-cell ${esHoy ? 'hoy' : ''}" data-fecha="${fechaStr}">${dia}</div>`;
    }

    // Días del mes siguiente (relleno)
    const totalCeldas = primerDiaSemana + diasEnMes;
    const celdasRestantes = totalCeldas % 7 === 0 ? 0 : 7 - (totalCeldas % 7);
    const mesSiguiente = mes === 11 ? 0 : mes + 1;
    const anioMesSiguiente = mes === 11 ? anio + 1 : anio;

    for (let dia = 1; dia <= celdasRestantes; dia++) {
        const fechaStr = `${anioMesSiguiente}-${(mesSiguiente + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
        html += `<div class="dia-cell otro-mes" data-fecha="${fechaStr}">${dia}</div>`;
    }

    html += '</div>';
    mesDiv.innerHTML = html;

    return mesDiv;
}

// ===========================
// BLOQUES DE VACACIONES
// ===========================

function crearBloqueVacaciones() {
    const selectEmpleado = document.getElementById('selectEmpleado');
    const diasVacaciones = parseInt(document.getElementById('diasVacaciones').value);

    const empleadoId = selectEmpleado.value;

    if (!empleadoId) {
        alert('Por favor, seleccione un empleado');
        return;
    }

    if (!diasVacaciones || diasVacaciones < 1) {
        alert('Por favor, ingrese una cantidad válida de días');
        return;
    }

    const empleado = empleados.find(e => e.id === empleadoId);
    if (!empleado) return;

    // Crear objeto de vacaciones
    const vacacion = {
        id: generarId(),
        empleadoId: empleado.id,
        dias: diasVacaciones,
        fechaInicio: null // Se asignará cuando se coloque en el calendario
    };

    vacaciones.push(vacacion);
    guardarVacaciones();

    // Crear bloque visual temporal
    crearBloqueVisual(vacacion, empleado, true);
}

function crearBloqueVisual(vacacion, empleado, esNuevo = false) {
    const bloque = document.createElement('div');
    bloque.className = 'bloque-vacaciones' + (esNuevo ? ' bloque-temporal' : '');
    bloque.dataset.vacacionId = vacacion.id;
    bloque.style.backgroundColor = empleado.color;
    bloque.textContent = `${obtenerNombreCompleto(empleado)} (${vacacion.dias})`;

    // Hacer el bloque arrastrable
    bloque.draggable = true;
    bloque.addEventListener('dragstart', manejarDragStart);
    bloque.addEventListener('dragend', manejarDragEnd);

    if (esNuevo) {
        // Posicionar temporalmente en la parte superior del contenedor
        const container = document.getElementById('calendarioContainer');
        bloque.style.position = 'relative';
        bloque.style.marginBottom = '20px';
        bloque.style.width = 'fit-content';
        container.insertBefore(bloque, container.firstChild);
    } else if (vacacion.fechaInicio) {
        // Posicionar en el calendario según la fecha de inicio
        posicionarBloqueEnCalendario(bloque, vacacion);
    }

    return bloque;
}

function posicionarBloqueEnCalendario(bloqueOriginal, vacacion) {
    const fechaStr = vacacion.fechaInicio;

    // Buscar la celda de inicio
    const celdaInicio = document.querySelector(`.dia-cell[data-fecha="${fechaStr}"]`);
    if (!celdaInicio) return;

    // Obtener el grid de días
    const diasGrid = celdaInicio.parentElement;
    const todasLasCeldas = Array.from(diasGrid.querySelectorAll('.dia-cell'));
    const indiceCeldaInicio = todasLasCeldas.indexOf(celdaInicio);

    if (indiceCeldaInicio === -1) return;

    // Obtener dimensiones de celda
    const celdaRect = celdaInicio.getBoundingClientRect();
    const alturaCelda = celdaRect.height;

    // Calcular cuántos días quedan en la primera semana
    const columnaInicio = indiceCeldaInicio % 7;
    let diasRestantes = vacacion.dias;
    let indiceCeldaActual = indiceCeldaInicio;
    let filaActual = Math.floor(indiceCeldaInicio / 7);

    // Crear bloques para cada fila que necesite el período de vacaciones
    while (diasRestantes > 0 && indiceCeldaActual < todasLasCeldas.length) {
        const columnaActual = indiceCeldaActual % 7;
        const diasEnEstaFila = Math.min(diasRestantes, 7 - columnaActual);

        // Crear un bloque para esta fila
        const bloqueSegmento = bloqueOriginal.cloneNode(true);
        bloqueSegmento.dataset.vacacionId = vacacion.id;

        // Posicionar el bloque
        bloqueSegmento.style.position = 'absolute';
        bloqueSegmento.style.left = `${columnaActual * (100 / 7)}%`;
        bloqueSegmento.style.top = `${filaActual * (alturaCelda + 5)}px`;
        bloqueSegmento.style.width = `calc(${diasEnEstaFila * (100 / 7)}% - 5px)`;
        bloqueSegmento.style.height = `${alturaCelda - 10}px`;

        // Hacer el bloque arrastrable
        bloqueSegmento.draggable = true;
        bloqueSegmento.addEventListener('dragstart', manejarDragStart);
        bloqueSegmento.addEventListener('dragend', manejarDragEnd);

        diasGrid.appendChild(bloqueSegmento);

        // Actualizar para la siguiente fila
        diasRestantes -= diasEnEstaFila;
        indiceCeldaActual += diasEnEstaFila;

        // Si llegamos al final de la semana, pasar a la siguiente fila
        if (indiceCeldaActual % 7 !== 0 && diasRestantes > 0) {
            indiceCeldaActual = Math.ceil(indiceCeldaActual / 7) * 7;
        }
        filaActual = Math.floor(indiceCeldaActual / 7);
    }

    // Remover el bloque original ya que creamos los segmentos
    if (bloqueOriginal.parentElement) {
        bloqueOriginal.remove();
    }
}

function renderizarBloquesVacaciones() {
    // Limpiar todos los bloques de vacaciones existentes
    document.querySelectorAll('.bloque-vacaciones').forEach(b => b.remove());

    // Renderizar bloques guardados
    vacaciones.forEach(vacacion => {
        if (!vacacion.fechaInicio) return;

        const empleado = empleados.find(e => e.id === vacacion.empleadoId);
        if (!empleado) return;

        crearBloqueVisual(vacacion, empleado, false);
    });
}

// ===========================
// DRAG & DROP
// ===========================

let draggedElement = null;
let draggedVacacion = null;

function manejarDragStart(e) {
    draggedElement = e.target;
    draggedElement.classList.add('dragging');

    const vacacionId = draggedElement.dataset.vacacionId;
    draggedVacacion = vacaciones.find(v => v.id === vacacionId);

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedElement.innerHTML);

    // Habilitar drop en las celdas
    document.querySelectorAll('.dia-cell').forEach(celda => {
        celda.addEventListener('dragover', manejarDragOver);
        celda.addEventListener('drop', manejarDrop);
    });
}

function manejarDragEnd(e) {
    draggedElement.classList.remove('dragging');

    // Deshabilitar drop en las celdas
    document.querySelectorAll('.dia-cell').forEach(celda => {
        celda.removeEventListener('dragover', manejarDragOver);
        celda.removeEventListener('drop', manejarDrop);
    });

    draggedElement = null;
}

function manejarDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function manejarDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    const celdaDestino = e.target.closest('.dia-cell');
    if (!celdaDestino || !draggedVacacion) return;

    const fechaDestino = celdaDestino.dataset.fecha;

    // Actualizar la fecha de inicio de la vacación
    draggedVacacion.fechaInicio = fechaDestino;
    guardarVacaciones();

    // Remover el bloque anterior
    if (draggedElement) {
        draggedElement.remove();
    }

    // Recrear el bloque en la nueva posición
    const empleado = empleados.find(e => e.id === draggedVacacion.empleadoId);
    if (empleado) {
        crearBloqueVisual(draggedVacacion, empleado, false);
    }

    return false;
}

// ===========================
// INICIALIZACIÓN
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    inicializarModoOscuro();
    inicializarNavegacion();
    inicializarModuloEmpleados();
    inicializarModuloCalendario();
});

// Hacer funciones globales para los botones inline
window.editarEmpleado = editarEmpleado;
window.eliminarEmpleado = eliminarEmpleado;
