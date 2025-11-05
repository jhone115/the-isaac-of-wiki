// Cache para almacenar los datos cargados
let personajesData = null;

async function cargarDatosPersonajes() {
    if (personajesData) {
        return personajesData;
    }
    
    console.log('🔍 Intentando cargar JSON...');
    
    try {
        // Ruta ABSOLUTA para GitHub Pages
        const baseUrl = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
        const jsonUrl = `personajes/personajes_data.json`;
        
        console.log('personajes/personajes_data.json', jsonUrl);
        
        const response = await fetch(jsonUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ JSON cargado correctamente');
        
        personajesData = data;
        return personajesData;
        
    } catch (error) {
        console.error('❌ Error cargando JSON:', error);
        // En caso de error, usar datos de ejemplo para la demo
        return getDatosHardcodeados();
    }
}

// Función para generar corazones de vida
function generarCorazones(vida) {
    let corazones = "";
    vida.forEach(obj => {
        for (let i = 0; i < obj.cantidad; i++) {
            corazones += `<img src="objetos/consumibles/corazon ${obj.tipo}.png" alt="corazón ${obj.tipo}" width="20">`;
        }
    });
    return corazones;
}

// Función para obtener personajes aleatorios
function obtenerPersonajesAleatorios(personajes, cantidad = 3) {
    const ids = Object.keys(personajes);
    const aleatorios = [];
    
    // Asegurarse de no repetir personajes
    while (aleatorios.length < cantidad && ids.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * ids.length);
        const idAleatorio = ids.splice(indiceAleatorio, 1)[0];
        aleatorios.push(idAleatorio);
    }
    
    return aleatorios;
}

// Función para crear el HTML de un personaje
function crearElementoPersonaje(personaje, id) {
    const imagenHTML = Array.isArray(personaje.imagen) 
        ? personaje.imagen.map(img => `<img src="${img}" alt="personajes/personajesimagenes/${personaje.nombre}">`).join('')
        : `<img src="${personaje.imagen}" alt="${personaje.nombre}">`;
    
    return `
        <div class="col-md-4">
            <div class="personaje-card">
                <a href="/personajes/personaje.html?id=${id}" style="text-decoration: none;">
                    <div class="personaje-imagen">
                        ${imagenHTML}
                    </div>
                    <div class="personaje-nombre">${personaje.nombre}</div>
                    <div class="personaje-vida">
                        ${generarCorazones(personaje.vida)}
                    </div>
                    <div class="personaje-descripcion">
                        ${personaje.descripcioncorta}
                    </div>
                </a>
            </div>
        </div>
    `;
}

// Función principal para inicializar la ruleta
async function inicializarRuleta() {
    const data = await cargarDatosPersonajes();
    const idsAleatorios = obtenerPersonajesAleatorios(data, 3);
    
    const contenedor = document.getElementById('ruleta-personajes');
    contenedor.innerHTML = '';
    
    idsAleatorios.forEach(id => {
        const personaje = data[id];
        const elementoHTML = crearElementoPersonaje(personaje, id);
        contenedor.innerHTML += elementoHTML;
    });
}

// Evento para el botón de nueva ruleta
document.getElementById('btn-nueva-ruleta').addEventListener('click', inicializarRuleta);

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarRuleta);