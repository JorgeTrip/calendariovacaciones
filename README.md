# Sistema de Gestión de Vacaciones

Aplicación web para gestionar las vacaciones del personal de una empresa de forma visual e interactiva.

## Características

### Módulo de Empleados
- Crear, editar y eliminar empleados
- Asignar color identificador personalizado a cada empleado
- Visualizar lista completa de empleados registrados
- Campos: Nombre, Apellido, Departamento y Color

### Módulo de Calendario
- Visualización de múltiples meses simultáneamente
- Selección múltiple de meses a visualizar
- Selector de año (rango configurable)
- Interfaz intuitiva y responsive

### Gestión de Vacaciones
- Selección de empleado para asignar vacaciones
- Definición de cantidad de días de vacaciones
- Bloques visuales de color identificados con:
  - Nombre del empleado
  - Cantidad de días entre paréntesis
  - Color personalizado del empleado

### Funcionalidad Drag & Drop
- Bloques de vacaciones completamente arrastrables
- Reposicionamiento mediante mouse
- Ajuste automático al calendario
- Los bloques se adaptan a los días disponibles en cada semana

### Persistencia de Datos
- Almacenamiento local automático (localStorage)
- Los datos persisten al cerrar y reabrir el navegador
- No requiere servidor ni base de datos

## Cómo Usar

### 1. Abrir la Aplicación
Simplemente abre el archivo `index.html` en tu navegador web favorito.

### 2. Gestionar Empleados

1. En el módulo "Empleados" (activo por defecto)
2. Completa el formulario con los datos del empleado:
   - Nombre (obligatorio)
   - Apellido (obligatorio)
   - Departamento (opcional)
   - Color identificador (selecciona el que prefieras)
3. Haz clic en "Guardar"
4. El empleado aparecerá en la lista inferior
5. Puedes editar o eliminar empleados usando los botones correspondientes

### 3. Crear Calendario de Vacaciones

1. Haz clic en el botón "Calendario" en la navegación superior
2. En "Seleccionar meses a visualizar":
   - Mantén presionada la tecla Ctrl (Windows/Linux) o Cmd (Mac)
   - Haz clic en los meses que deseas visualizar
   - Puedes seleccionar múltiples meses
3. Selecciona el año deseado
4. Haz clic en "Mostrar Calendario"
5. Se generará un calendario con los meses seleccionados

### 4. Asignar Vacaciones

1. En la sección "Asignar Vacaciones":
2. Selecciona un empleado de la lista desplegable
3. Ingresa la cantidad de días de vacaciones
4. Haz clic en "Crear Bloque de Vacaciones"
5. Aparecerá un bloque temporal en la parte superior del calendario

### 5. Posicionar Bloques de Vacaciones

1. Arrastra el bloque creado con el mouse
2. Suéltalo sobre la fecha de inicio deseada en el calendario
3. El bloque se ajustará automáticamente al calendario
4. Puedes reposicionar el bloque las veces que necesites
5. Los cambios se guardan automáticamente

## Tecnologías Utilizadas

- HTML5
- CSS3 (con diseño responsive)
- JavaScript (ES6+)
- LocalStorage para persistencia de datos
- Drag and Drop API

## Estructura del Proyecto

```
calendariovacaciones/
├── index.html      # Estructura HTML principal
├── styles.css      # Estilos y diseño
├── app.js          # Lógica de la aplicación
└── README.md       # Este archivo
```

## Compatibilidad

La aplicación es compatible con todos los navegadores modernos:
- Chrome (recomendado)
- Firefox
- Safari
- Edge

## Características Técnicas

- **Responsive Design**: Funciona en dispositivos móviles y tablets
- **Sin Dependencias**: No requiere bibliotecas externas
- **100% Cliente**: Funciona completamente en el navegador
- **Persistencia Local**: Los datos se mantienen entre sesiones

## Notas Importantes

- Los datos se almacenan localmente en tu navegador
- Si limpias los datos del navegador, perderás la información guardada
- Los bloques de vacaciones se adaptan automáticamente al ancho disponible en cada semana
- El sistema marca automáticamente el día actual en amarillo
- Los días de otros meses se muestran en gris claro para mejor orientación

## Mejoras Futuras Posibles

- Exportar/importar datos (JSON, CSV, Excel)
- Imprimir calendario
- Vista anual completa
- Estadísticas de vacaciones
- Notificaciones y alertas
- Backend con base de datos
- Múltiples usuarios con autenticación
- Aprobación de vacaciones (flujo de trabajo)
- Integración con calendarios externos (Google Calendar, Outlook)

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.