// pisos.js - Lógica principal con carga asíncrona de datos
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM cargado - inicializando pisos.js');

    // Cargar datos primero
    const datos = await cargarDatosPisos();
    if (!datos) {
        console.error('No se pudieron cargar los datos de pisos');
        return;
    }

    console.log('Datos de pisos cargados correctamente');

    const pisoLinks = document.querySelectorAll('.piso-link');
    console.log(`Encontrados ${pisoLinks.length} enlaces de pisos`);
    
    pisoLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const pisoNombre = this.getAttribute('data-piso');
            console.log(`Clic en piso: ${pisoNombre}`);

            window.location.href = `piso.html?piso=${pisoNombre}`;
        });
    });

    if (window.location.pathname.includes('piso.html')) {
        console.log('Estamos en piso.html - procesando parámetros');
        procesarPisoSeleccionado(datos);
    }
});

function procesarPisoSeleccionado(datos) {
    const urlParams = new URLSearchParams(window.location.search);
    const pisoNombre = urlParams.get('piso');
    
    console.log(`Piso seleccionado: ${pisoNombre}`);
    
    if (pisoNombre) {
        document.title = `the isaac of wiki/${pisoNombre}`;
        actualizarFondo(pisoNombre, datos.fondosPisos);
        actualizarContenidoPiso(pisoNombre, datos.informacionPisos);
    } else {
        console.log('No se encontró parámetro de piso en la URL');
    }
}

function actualizarFondo(pisoNombre, fondosPisos) {
    const rutaCompleta = fondosPisos[pisoNombre];
    
    if (rutaCompleta) {
        console.log(`Intentando cargar fondo: ${rutaCompleta}`);

        const img = new Image();
        img.onload = function() {
            document.body.style.backgroundImage = `url('${rutaCompleta}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundAttachment = 'fixed';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
            console.log(`Fondo aplicado correctamente: ${rutaCompleta}`);
        };
        img.onerror = function() {
            console.error(`No se pudo cargar la imagen: ${rutaCompleta}`);
            document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            document.body.style.backgroundAttachment = 'fixed';
        };
        img.src = rutaCompleta;
    } else {
        console.warn(`No se encontró mapeo para el piso: ${pisoNombre}`);
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        document.body.style.backgroundAttachment = 'fixed';
    }
}

function actualizarContenidoPiso(pisoNombre, informacionPisos) {
    const tituloPiso = document.querySelector('h1');
    if (tituloPiso) {
        tituloPiso.textContent = pisoNombre.toUpperCase();
        tituloPiso.style.textAlign = 'center';
    }

    const contenedorInfo = document.getElementById('piso-info');
    if (contenedorInfo) {
        contenedorInfo.innerHTML = '';

        const infoPiso = informacionPisos[pisoNombre];
        
        if (infoPiso) {
            const contenido = `
                <h1 style="text-align: center;"><b>${infoPiso.nombre.toUpperCase()}</b></h1>
                <div class="piso-details">
                    <h2>Información del Piso</h2>
                    <p>${infoPiso.descripcion}</p>
                    
                    <h3>Características:</h3>
                    <ul>
                        ${infoPiso.caracteristicas.map(caract => `<li>${caract}</li>`).join('')}
                    </ul>
                    
                    <h3>Estrategias:</h3>
                    <p>${infoPiso.estrategias}</p>
                </div>
            `;
            contenedorInfo.innerHTML = contenido;
        } else {
            // Contenido por defecto si no hay información específica
            const contenido = `
                <h1 style="text-align: center;"><b>${pisoNombre.toUpperCase()}</b></h1>
                <div class="piso-details">
                    <h2>Información del Piso</h2>
                    <p>Esta es la página para <strong>${pisoNombre}</strong>. Aquí puedes encontrar información detallada sobre este piso.</p>
                    
                    <h3>Características:</h3>
                    <ul>
                        <li>Enemigos característicos</li>
                        <li>Jefes que aparecen</li>
                        <li>Objetos especiales</li>
                        <li>Salas secretas</li>
                    </ul>
                    
                    <h3>Estrategias:</h3>
                    <p>Consejos para superar este piso...</p>
                </div>
            `;
            contenedorInfo.innerHTML = contenido;
        }
    }
}