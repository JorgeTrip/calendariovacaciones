// ===========================
// ESTADO DE LA APLICACIÓN
// ===========================

let empleados = [];
let vacaciones = [];
let coberturas = {}; // { vacacionId: empleadoIdQueReemplaza }
let editandoEmpleadoId = null;
let editandoVacacionId = null;

// ===========================
// UTILIDADES
// ===========================

function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function obtenerNombreCompleto(empleado) {
    return `${empleado.nombre} ${empleado.apellido}`;
}

function calcularDiasUsados(empleadoId) {
    return vacaciones
        .filter(v => v.empleadoId === empleadoId && v.fechaInicio)
        .reduce((total, v) => total + v.dias, 0);
}

function calcularDiasRestantes(empleadoId) {
    const empleado = empleados.find(e => e.id === empleadoId);
    if (!empleado) return 0;
    const diasUsados = calcularDiasUsados(empleadoId);
    return (empleado.diasDisponibles || 30) - diasUsados;
}

function calcularFinesSemana(empleado, fechaInicio, dias) {
    const finesSemana = [];
    const fecha = new Date(fechaInicio);

    for (let i = 0; i < dias; i++) {
        const diaSemana = fecha.getDay();
        const fechaStr = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getDate().toString().padStart(2, '0')}`;

        // Si es sábado (6) y trabaja sábados, o domingo (0) y trabaja domingos
        if ((diaSemana === 6 && empleado.trabajaSabado) || (diaSemana === 0 && empleado.trabajaDomingo)) {
            const nombreDia = diaSemana === 6 ? 'Sábado' : 'Domingo';
            finesSemana.push({ fecha: fechaStr, dia: nombreDia });
        }

        fecha.setDate(fecha.getDate() + 1);
    }

    return finesSemana;
}

// ===========================
// PERSISTENCIA DE DATOS
// ===========================

function cargarDatos() {
    const datosGuardados = localStorage.getItem('empleados');
    if (datosGuardados) {
        empleados = JSON.parse(datosGuardados);
        // Migrar empleados antiguos que no tienen los nuevos campos
        empleados = empleados.map(emp => ({
            ...emp,
            diasDisponibles: emp.diasDisponibles !== undefined ? emp.diasDisponibles : 30,
            trabajaSabado: emp.trabajaSabado || false,
            trabajaDomingo: emp.trabajaDomingo || false
        }));
    }

    const vacacionesGuardadas = localStorage.getItem('vacaciones');
    if (vacacionesGuardadas) {
        vacaciones = JSON.parse(vacacionesGuardadas);
    }

    const coberturasGuardadas = localStorage.getItem('coberturas');
    if (coberturasGuardadas) {
        coberturas = JSON.parse(coberturasGuardadas);
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

function guardarCoberturas() {
    localStorage.setItem('coberturas', JSON.stringify(coberturas));
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
        renderizarBloquesPendientes();
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
    const diasDisponibles = parseInt(document.getElementById('diasDisponibles').value);
    const trabajaSabado = document.getElementById('trabajaSabado').checked;
    const trabajaDomingo = document.getElementById('trabajaDomingo').checked;
    const color = document.getElementById('color').value;

    if (editandoEmpleadoId) {
        // Editar empleado existente
        const empleado = empleados.find(e => e.id === editandoEmpleadoId);
        if (empleado) {
            empleado.nombre = nombre;
            empleado.apellido = apellido;
            empleado.diasDisponibles = diasDisponibles;
            empleado.trabajaSabado = trabajaSabado;
            empleado.trabajaDomingo = trabajaDomingo;
            empleado.color = color;
        }
        editandoEmpleadoId = null;
    } else {
        // Crear nuevo empleado
        const nuevoEmpleado = {
            id: generarId(),
            nombre,
            apellido,
            diasDisponibles,
            trabajaSabado,
            trabajaDomingo,
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
    document.getElementById('diasDisponibles').value = empleado.diasDisponibles || 30;
    document.getElementById('trabajaSabado').checked = empleado.trabajaSabado || false;
    document.getElementById('trabajaDomingo').checked = empleado.trabajaDomingo || false;
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
    document.getElementById('diasDisponibles').value = 30;
    document.getElementById('trabajaSabado').checked = false;
    document.getElementById('trabajaDomingo').checked = false;
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

    lista.innerHTML = empleados.map(empleado => {
        const diasUsados = calcularDiasUsados(empleado.id);
        const diasRestantes = (empleado.diasDisponibles || 30) - diasUsados;
        const trabajaDias = [];
        if (empleado.trabajaSabado) trabajaDias.push('Sáb');
        if (empleado.trabajaDomingo) trabajaDias.push('Dom');
        const trabajaTexto = trabajaDias.length > 0 ? `Trabaja: ${trabajaDias.join(', ')}` : 'No trabaja fines de semana';

        return `
            <div class="empleado-card">
                <div class="empleado-info">
                    <div class="empleado-color" style="background-color: ${empleado.color}"></div>
                    <div class="empleado-datos">
                        <h4>${obtenerNombreCompleto(empleado)}</h4>
                        <p>${empleado.diasDisponibles || 30} días disponibles | ${diasRestantes} días restantes</p>
                        <p><small>${trabajaTexto}</small></p>
                    </div>
                </div>
                <div class="empleado-acciones">
                    <button class="btn btn-edit" onclick="editarEmpleado('${empleado.id}')">Editar</button>
                    <button class="btn btn-danger" onclick="eliminarEmpleado('${empleado.id}')">Eliminar</button>
                </div>
            </div>
        `;
    }).join('');
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
        const diasRestantes = calcularDiasRestantes(empleado.id);
        option.textContent = `${obtenerNombreCompleto(empleado)} (${diasRestantes} días disponibles)`;
        select.appendChild(option);
    });

    // Evento para mostrar días restantes al seleccionar
    select.addEventListener('change', mostrarDiasRestantes);
}

function mostrarDiasRestantes() {
    const select = document.getElementById('selectEmpleado');
    const diasRestantesDiv = document.getElementById('diasRestantes');
    const diasRestantesValor = document.getElementById('diasRestantesValor');
    const inputDiasVacaciones = document.getElementById('diasVacaciones');

    const empleadoId = select.value;

    if (!empleadoId) {
        diasRestantesDiv.style.display = 'none';
        inputDiasVacaciones.value = 15;
        renderizarBloquesPendientes();
        return;
    }

    const diasRestantes = calcularDiasRestantes(empleadoId);
    diasRestantesValor.textContent = diasRestantes;

    // Actualizar el campo de días con los días disponibles (permitir 0)
    inputDiasVacaciones.value = diasRestantes >= 0 ? diasRestantes : 0;
    inputDiasVacaciones.max = diasRestantes;

    // Aplicar clases de advertencia
    diasRestantesDiv.classList.remove('warning', 'danger');
    if (diasRestantes <= 0) {
        diasRestantesDiv.classList.add('danger');
    } else if (diasRestantes <= 5) {
        diasRestantesDiv.classList.add('warning');
    }

    diasRestantesDiv.style.display = 'block';

    // Mostrar bloques pendientes de este empleado
    renderizarBloquesPendientes(empleadoId);
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
    renderizarCoberturasFinSemana();
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

    // Validar días disponibles
    const diasRestantes = calcularDiasRestantes(empleadoId);
    if (diasVacaciones > diasRestantes) {
        alert(`El empleado solo tiene ${diasRestantes} días disponibles. No puede asignar ${diasVacaciones} días.`);
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

    // Actualizar lista de bloques pendientes y días restantes
    renderizarBloquesPendientes();
    mostrarDiasRestantes();

    // Limpiar campo de días
    document.getElementById('diasVacaciones').value = 15;
}

function renderizarBloquesPendientes(empleadoIdFiltro = null) {
    const bloquesPendientesDiv = document.getElementById('bloquesPendientes');
    const lista = document.getElementById('listaBloquesPendientes');

    // Filtrar vacaciones sin fecha de inicio (pendientes)
    let pendientes = vacaciones.filter(v => !v.fechaInicio);

    // Si hay filtro de empleado, aplicarlo
    if (empleadoIdFiltro) {
        pendientes = pendientes.filter(v => v.empleadoId === empleadoIdFiltro);
    }

    if (pendientes.length === 0) {
        bloquesPendientesDiv.style.display = 'none';
        return;
    }

    bloquesPendientesDiv.style.display = 'block';
    lista.innerHTML = '';

    pendientes.forEach(vacacion => {
        const empleado = empleados.find(e => e.id === vacacion.empleadoId);
        if (!empleado) return;

        const bloqueContainer = crearBloqueControles(vacacion, empleado);
        lista.appendChild(bloqueContainer);
    });
}

function crearBloqueControles(vacacion, empleado) {
    const container = document.createElement('div');
    container.className = 'bloque-pendiente-container';
    container.dataset.vacacionId = vacacion.id;

    const bloqueVisual = crearBloqueVisual(vacacion, empleado, true);

    // Crear icono de borrar
    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn-eliminar-bloque';
    btnEliminar.innerHTML = '🗑️';
    btnEliminar.title = 'Eliminar bloque';
    btnEliminar.addEventListener('click', (e) => {
        e.stopPropagation();
        eliminarVacacionRapido(vacacion.id);
    });

    // Al hacer clic en el bloque (no en el botón), abrir modal
    bloqueVisual.addEventListener('click', (e) => {
        e.stopPropagation();
        abrirModalEdicion(vacacion.id);
    });

    container.appendChild(bloqueVisual);
    container.appendChild(btnEliminar);

    return container;
}

function eliminarVacacionRapido(id) {
    if (!confirm('¿Está seguro de eliminar este bloque de vacaciones?')) return;

    vacaciones = vacaciones.filter(v => v.id !== id);
    guardarVacaciones();

    // Actualizar visualización y días restantes
    const selectEmpleado = document.getElementById('selectEmpleado');
    const empleadoId = selectEmpleado.value;

    if (empleadoId) {
        renderizarBloquesPendientes(empleadoId);
        mostrarDiasRestantes();
    } else {
        renderizarBloquesPendientes();
    }

    if (document.querySelector('.calendarios-grid')) {
        renderizarBloquesVacaciones();
        renderizarCoberturasFinSemana();
    }
}

function eliminarVacacion(id) {
    if (!confirm('¿Está seguro de eliminar este bloque de vacaciones?')) return;

    vacaciones = vacaciones.filter(v => v.id !== id);
    guardarVacaciones();

    // Actualizar visualización
    const selectEmpleado = document.getElementById('selectEmpleado');
    const empleadoId = selectEmpleado.value;

    if (empleadoId) {
        renderizarBloquesPendientes(empleadoId);
        mostrarDiasRestantes();
    } else {
        renderizarBloquesPendientes();
    }

    if (document.querySelector('.calendarios-grid')) {
        renderizarBloquesVacaciones();
        renderizarCoberturasFinSemana();
    }

    cerrarModal();
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

    // Agregar evento de clic para editar (solo si no está en la lista de pendientes)
    if (!esNuevo) {
        bloque.addEventListener('click', (e) => {
            e.stopPropagation();
            abrirModalEdicion(vacacion.id);
        });
    }

    if (esNuevo) {
        // Crear bloque para lista de pendientes
        bloque.style.width = 'fit-content';
        bloque.style.display = 'inline-flex';
        bloque.style.padding = '8px 12px';
        bloque.style.cursor = 'pointer';
        return bloque;
    } else if (vacacion.fechaInicio) {
        // Posicionar en el calendario según la fecha de inicio
        posicionarBloqueEnCalendario(bloque, vacacion);
    }

    return bloque;
}

function calcularBloquesPorDia(fechaInicio, dias) {
    // Calcular todos los días que ocupa este bloque
    const fechasOcupadas = [];
    const fecha = new Date(fechaInicio);

    for (let i = 0; i < dias; i++) {
        const fechaStr = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getDate().toString().padStart(2, '0')}`;
        fechasOcupadas.push(fechaStr);
        fecha.setDate(fecha.getDate() + 1);
    }

    return fechasOcupadas;
}

function obtenerBloquesPorFecha(fecha, vacacionIdExcluir = null) {
    // Obtener todas las vacaciones que ocupan esta fecha
    return vacaciones.filter(v => {
        if (!v.fechaInicio || v.id === vacacionIdExcluir) return false;
        const fechasOcupadas = calcularBloquesPorDia(v.fechaInicio, v.dias);
        return fechasOcupadas.includes(fecha);
    });
}

function posicionarBloqueEnCalendario(bloqueOriginal, vacacion) {
    const fechaInicio = new Date(vacacion.fechaInicio);
    let diasRestantes = vacacion.dias;

    // Calcular cuántos bloques máximo hay en algún día del rango
    const fechasOcupadas = calcularBloquesPorDia(vacacion.fechaInicio, vacacion.dias);
    let maxBloquesPorDia = 1;

    fechasOcupadas.forEach(fecha => {
        const bloquesEnFecha = obtenerBloquesPorFecha(fecha, vacacion.id);
        maxBloquesPorDia = Math.max(maxBloquesPorDia, bloquesEnFecha.length + 1);
    });

    // Determinar posición vertical de este bloque
    const bloquesPrimeraFecha = obtenerBloquesPorFecha(fechasOcupadas[0], vacacion.id);
    const posicionEnDia = bloquesPrimeraFecha.length;

    // Procesar día por día
    let fechaActual = new Date(fechaInicio);
    let diasProcesados = 0;

    while (diasProcesados < vacacion.dias) {
        const fechaStr = `${fechaActual.getFullYear()}-${(fechaActual.getMonth() + 1).toString().padStart(2, '0')}-${fechaActual.getDate().toString().padStart(2, '0')}`;

        // Buscar la celda para esta fecha
        const celda = document.querySelector(`.dia-cell[data-fecha="${fechaStr}"]`);

        if (celda) {
            const diasGrid = celda.parentElement;
            const todasLasCeldas = Array.from(diasGrid.querySelectorAll('.dia-cell'));
            const indiceCelda = todasLasCeldas.indexOf(celda);

            if (indiceCelda !== -1) {
                // Calcular cuántos días consecutivos podemos poner en este grid
                const columnaActual = indiceCelda % 7;
                const diasRestantesEnGrid = Math.min(
                    vacacion.dias - diasProcesados,
                    todasLasCeldas.length - indiceCelda
                );

                // Calcular cuántos días hasta el final de la semana
                const diasHastaFinSemana = 7 - columnaActual;
                const diasEnEsteSegmento = Math.min(diasRestantesEnGrid, diasHastaFinSemana);

                // Obtener dimensiones de celda
                const celdaRect = celda.getBoundingClientRect();
                const alturaCelda = celdaRect.height;

                // Calcular altura del bloque
                const alturaBloque = (alturaCelda - 10) / maxBloquesPorDia;
                const offsetVertical = posicionEnDia * alturaBloque;

                // Calcular fila
                const filaActual = Math.floor(indiceCelda / 7);

                // Crear segmento de bloque
                const bloqueSegmento = bloqueOriginal.cloneNode(true);
                bloqueSegmento.dataset.vacacionId = vacacion.id;

                bloqueSegmento.style.position = 'absolute';
                bloqueSegmento.style.left = `${columnaActual * (100 / 7)}%`;
                bloqueSegmento.style.top = `${filaActual * (alturaCelda + 5) + offsetVertical}px`;
                bloqueSegmento.style.width = `calc(${diasEnEsteSegmento * (100 / 7)}% - 5px)`;
                bloqueSegmento.style.height = `${alturaBloque}px`;

                bloqueSegmento.draggable = true;
                bloqueSegmento.addEventListener('dragstart', manejarDragStart);
                bloqueSegmento.addEventListener('dragend', manejarDragEnd);
                bloqueSegmento.addEventListener('click', (e) => {
                    e.stopPropagation();
                    abrirModalEdicion(vacacion.id);
                });

                diasGrid.appendChild(bloqueSegmento);

                diasProcesados += diasEnEsteSegmento;
            }
        }

        // Avanzar al siguiente día
        fechaActual.setDate(fechaActual.getDate() + 1);

        // Seguridad: evitar bucle infinito
        if (diasProcesados >= vacacion.dias) break;
    }

    // Remover el bloque original
    if (bloqueOriginal.parentElement && bloqueOriginal.classList.contains('bloque-temporal')) {
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
// MODAL DE EDICIÓN
// ===========================

function abrirModalEdicion(vacacionId) {
    const vacacion = vacaciones.find(v => v.id === vacacionId);
    if (!vacacion) return;

    const empleado = empleados.find(e => e.id === vacacion.empleadoId);
    if (!empleado) return;

    editandoVacacionId = vacacionId;

    // Actualizar contenido del modal
    document.getElementById('modalEmpleadoNombre').textContent = obtenerNombreCompleto(empleado);
    document.getElementById('modalDias').value = vacacion.dias;
    document.getElementById('modalFechaInicio').value = vacacion.fechaInicio || '';

    // Mostrar fines de semana si hay fecha de inicio
    if (vacacion.fechaInicio) {
        const finesSemana = calcularFinesSemana(empleado, vacacion.fechaInicio, vacacion.dias);
        if (finesSemana.length > 0) {
            const detalleDiv = document.getElementById('modalFinesSemanaDetalle');
            detalleDiv.innerHTML = finesSemana.map(fs =>
                `<span style="display: block;">${fs.dia} ${fs.fecha}</span>`
            ).join('');
            document.getElementById('modalFinesSemana').style.display = 'block';
        } else {
            document.getElementById('modalFinesSemana').style.display = 'none';
        }
    } else {
        document.getElementById('modalFinesSemana').style.display = 'none';
    }

    // Mostrar modal
    const modal = document.getElementById('modalEditarBloque');
    modal.classList.add('show');
}

function cerrarModal() {
    const modal = document.getElementById('modalEditarBloque');
    modal.classList.remove('show');
    editandoVacacionId = null;
}

function guardarEdicionBloque() {
    if (!editandoVacacionId) return;

    const vacacion = vacaciones.find(v => v.id === editandoVacacionId);
    if (!vacacion) return;

    const nuevosDias = parseInt(document.getElementById('modalDias').value);
    const nuevaFechaInicio = document.getElementById('modalFechaInicio').value;

    if (!nuevosDias || nuevosDias < 1) {
        alert('Por favor, ingrese una cantidad válida de días');
        return;
    }

    // Validar días disponibles si se aumenta
    const empleado = empleados.find(e => e.id === vacacion.empleadoId);
    if (empleado) {
        const diasUsadosSinEste = vacaciones
            .filter(v => v.empleadoId === empleado.id && v.id !== vacacion.id && v.fechaInicio)
            .reduce((total, v) => total + v.dias, 0);
        const diasDisponibles = (empleado.diasDisponibles || 30) - diasUsadosSinEste;

        if (nuevosDias > diasDisponibles) {
            alert(`Este empleado solo tiene ${diasDisponibles} días disponibles.`);
            return;
        }
    }

    vacacion.dias = nuevosDias;
    if (nuevaFechaInicio) {
        vacacion.fechaInicio = nuevaFechaInicio;
    }
    guardarVacaciones();

    // Actualizar visualización
    renderizarBloquesPendientes();
    if (document.querySelector('.calendarios-grid')) {
        renderizarBloquesVacaciones();
        renderizarCoberturasFinSemana();
    }

    cerrarModal();
}

function inicializarModal() {
    const modal = document.getElementById('modalEditarBloque');
    const btnCerrar = modal.querySelector('.modal-close');
    const btnGuardar = document.getElementById('btnGuardarEdicion');
    const btnEliminar = document.getElementById('btnEliminarBloque');
    const btnCancelar = document.getElementById('btnCancelarEdicion');

    btnCerrar.addEventListener('click', cerrarModal);
    btnCancelar.addEventListener('click', cerrarModal);
    btnGuardar.addEventListener('click', guardarEdicionBloque);
    btnEliminar.addEventListener('click', () => {
        if (editandoVacacionId) {
            eliminarVacacion(editandoVacacionId);
        }
    });

    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            cerrarModal();
        }
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
    if (e.preventDefault) {
        e.preventDefault();
    }

    let celdaDestino = null;

    // Método 1: Intentar obtener directamente la celda
    celdaDestino = e.target.closest('.dia-cell');

    // Método 2: Si soltamos sobre un bloque, buscar la celda debajo
    if (!celdaDestino) {
        const bloqueDestino = e.target.closest('.bloque-vacaciones');
        if (bloqueDestino) {
            // Ocultar temporalmente el bloque arrastrado para poder ver qué hay debajo
            if (draggedElement) {
                draggedElement.style.visibility = 'hidden';
            }

            // Obtener el elemento en la posición del mouse
            const elementoDebajo = document.elementFromPoint(e.clientX, e.clientY);

            // Restaurar visibilidad
            if (draggedElement) {
                draggedElement.style.visibility = 'visible';
            }

            // Intentar encontrar la celda
            if (elementoDebajo) {
                celdaDestino = elementoDebajo.closest('.dia-cell');
            }

            // Si aún no hay celda, buscar en el grid padre del bloque
            if (!celdaDestino) {
                const diasGrid = bloqueDestino.parentElement;
                if (diasGrid && diasGrid.classList.contains('dias-grid')) {
                    // Usar la fecha de inicio del bloque sobre el que soltamos
                    const bloqueVacacionDestino = vacaciones.find(v => v.id === bloqueDestino.dataset.vacacionId);
                    if (bloqueVacacionDestino && bloqueVacacionDestino.fechaInicio) {
                        celdaDestino = diasGrid.querySelector(`[data-fecha="${bloqueVacacionDestino.fechaInicio}"]`);
                    }
                }
            }
        }
    }

    if (!celdaDestino || !draggedVacacion) return false;

    const fechaDestino = celdaDestino.dataset.fecha;
    if (!fechaDestino) return false;

    // Actualizar la fecha de inicio de la vacación
    draggedVacacion.fechaInicio = fechaDestino;
    guardarVacaciones();

    // Eliminar TODOS los segmentos visuales de este bloque (para evitar duplicados)
    document.querySelectorAll(`.bloque-vacaciones[data-vacacion-id="${draggedVacacion.id}"]`).forEach(b => b.remove());

    // Actualizar visualización completa
    const selectEmpleado = document.getElementById('selectEmpleado');
    const empleadoId = selectEmpleado.value;

    if (empleadoId) {
        renderizarBloquesPendientes(empleadoId);
        mostrarDiasRestantes();
    } else {
        renderizarBloquesPendientes();
    }

    renderizarBloquesVacaciones();
    renderizarCoberturasFinSemana();

    draggedElement = null;
    draggedVacacion = null;

    return false;
}

// ===========================
// COBERTURA DE FINES DE SEMANA
// ===========================

function renderizarCoberturasFinSemana() {
    const coberturaDiv = document.getElementById('coberturaFinesSemana');
    const listaCoberturas = document.getElementById('listaCoberturas');

    // Obtener todas las vacaciones con fines de semana
    const vacacionesConFinesSemana = vacaciones
        .filter(v => v.fechaInicio)
        .map(v => {
            const empleado = empleados.find(e => e.id === v.empleadoId);
            if (!empleado) return null;

            const finesSemana = calcularFinesSemana(empleado, v.fechaInicio, v.dias);
            if (finesSemana.length === 0) return null;

            return { vacacion: v, empleado, finesSemana };
        })
        .filter(item => item !== null);

    if (vacacionesConFinesSemana.length === 0) {
        coberturaDiv.style.display = 'none';
        return;
    }

    coberturaDiv.style.display = 'block';
    listaCoberturas.innerHTML = '';

    vacacionesConFinesSemana.forEach(({ vacacion, empleado, finesSemana }) => {
        const coberturaItem = document.createElement('div');
        coberturaItem.className = 'cobertura-item';

        const empleadoDiv = document.createElement('div');
        empleadoDiv.className = 'cobertura-empleado';
        empleadoDiv.innerHTML = `
            <div class="cobertura-color" style="background-color: ${empleado.color}"></div>
            <div class="cobertura-info">
                <strong>${obtenerNombreCompleto(empleado)}</strong>
                <small>${finesSemana.length} fin(es) de semana</small>
            </div>
        `;

        const finesSemanaDiv = document.createElement('div');
        finesSemanaDiv.className = 'cobertura-info';
        finesSemanaDiv.innerHTML = `
            <strong>Fechas:</strong>
            <small>${finesSemana.map(fs => `${fs.dia} ${fs.fecha}`).join(', ')}</small>
        `;

        const selectDiv = document.createElement('div');
        selectDiv.className = 'cobertura-select';
        selectDiv.innerHTML = `
            <label>Reemplazo:</label>
            <select class="cobertura-empleado-select" data-vacacion-id="${vacacion.id}">
                <option value="">-- Sin asignar --</option>
                <option value="REFUERZO" ${coberturas[vacacion.id] === 'REFUERZO' ? 'selected' : ''}>Pedir refuerzo</option>
                ${empleados
                    .filter(e => e.id !== empleado.id)
                    .map(e => `<option value="${e.id}" ${coberturas[vacacion.id] === e.id ? 'selected' : ''}>${obtenerNombreCompleto(e)}</option>`)
                    .join('')}
            </select>
        `;

        coberturaItem.appendChild(empleadoDiv);
        coberturaItem.appendChild(finesSemanaDiv);
        coberturaItem.appendChild(selectDiv);
        listaCoberturas.appendChild(coberturaItem);

        // Evento de cambio en el select
        const select = selectDiv.querySelector('select');
        select.addEventListener('change', (e) => {
            const empleadoReemplazoId = e.target.value;
            if (empleadoReemplazoId) {
                coberturas[vacacion.id] = empleadoReemplazoId;
            } else {
                delete coberturas[vacacion.id];
            }
            guardarCoberturas();
        });
    });
}

// ===========================
// IMPORTAR/EXPORTAR DATOS
// ===========================

function exportarDatos() {
    const datos = {
        version: '1.0',
        fecha_exportacion: new Date().toISOString(),
        empleados,
        vacaciones,
        coberturas
    };

    const json = JSON.stringify(datos, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const fechaArchivo = new Date().toISOString().split('T')[0];
    a.download = `vacaciones_backup_${fechaArchivo}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Datos exportados correctamente');
}

function importarDatos() {
    const inputFile = document.getElementById('inputImportar');
    inputFile.click();
}

function procesarArchivoImportado(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();

    lector.onload = function(evento) {
        try {
            const datos = JSON.parse(evento.target.result);

            // Validar estructura básica
            if (!datos.empleados || !Array.isArray(datos.empleados)) {
                throw new Error('El archivo no contiene un array válido de empleados');
            }

            if (!datos.vacaciones || !Array.isArray(datos.vacaciones)) {
                throw new Error('El archivo no contiene un array válido de vacaciones');
            }

            // Confirmar importación
            const mensaje = `¿Está seguro de importar los datos?\n\nEsto reemplazará todos los datos actuales:\n- ${datos.empleados.length} empleados\n- ${datos.vacaciones.length} bloques de vacaciones\n- ${Object.keys(datos.coberturas || {}).length} coberturas`;

            if (!confirm(mensaje)) {
                // Limpiar el input
                e.target.value = '';
                return;
            }

            // Importar datos
            empleados = datos.empleados;
            vacaciones = datos.vacaciones;
            coberturas = datos.coberturas || {};

            // Guardar en localStorage
            guardarEmpleados();
            guardarVacaciones();
            guardarCoberturas();

            // Actualizar interfaz
            renderizarListaEmpleados();
            actualizarSelectEmpleados();
            renderizarBloquesPendientes();

            // Si hay un calendario visible, actualizarlo
            if (document.querySelector('.calendarios-grid')) {
                renderizarBloquesVacaciones();
                renderizarCoberturasFinSemana();
            }

            alert('Datos importados correctamente');

            // Limpiar el input
            e.target.value = '';
        } catch (error) {
            alert(`Error al importar el archivo: ${error.message}`);
            console.error('Error de importación:', error);
            // Limpiar el input
            e.target.value = '';
        }
    };

    lector.onerror = function() {
        alert('Error al leer el archivo');
        // Limpiar el input
        e.target.value = '';
    };

    lector.readAsText(archivo);
}

function inicializarImportExport() {
    const btnExportar = document.getElementById('btnExportar');
    const btnImportar = document.getElementById('btnImportar');
    const inputImportar = document.getElementById('inputImportar');

    btnExportar.addEventListener('click', exportarDatos);
    btnImportar.addEventListener('click', importarDatos);
    inputImportar.addEventListener('change', procesarArchivoImportado);
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
    inicializarModal();
    inicializarImportExport();
    renderizarBloquesPendientes();
});

// Hacer funciones globales para los botones inline
window.editarEmpleado = editarEmpleado;
window.eliminarEmpleado = eliminarEmpleado;
