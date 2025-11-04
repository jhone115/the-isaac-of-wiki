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
        const jsonUrl = `${baseUrl}/personajes_data.json`;
        
        console.log('📡 URL del JSON:', jsonUrl);
        
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
        mostrarError('Error cargando los datos del personaje');
        return null;
    }
}

// Función principal MEJORADA con manejo de IDs
async function initializePersonajePage() {
    console.log('🚀 Inicializando página...');
    
    const params = new URLSearchParams(window.location.search);
    let personajeId = params.get("id");
    console.log('📝 Personaje ID desde URL:', personajeId);

    if (personajeId) {
        // Normalizar el ID (minúsculas, sin espacios, etc.)
        personajeId = personajeId.toLowerCase().trim();
        
        const data = await cargarDatosPersonajes();
        
        if (!data) {
            return;
        }
        
        console.log('📊 Datos disponibles:', Object.keys(data));
        
        // Buscar el personaje
        let personaje = data[personajeId];
        
        // Si no se encuentra, probar alternativas
        if (!personaje) {
            console.log('🔍 Buscando variaciones del ID...');
            
            const idVariations = {
                'isaac': 'isaac',
                'tainted isaac': 'tainted_isaac', 
                't isaac': 'tainted_isaac',
                'maggy': 'maggy',
                'magdalene': 'maggy',
                'tainted maggy': 'tainted_maggy',
                't maggy': 'tainted_maggy',
                'cain': 'cain',
                'tainted cain': 'tainted_cain',
                't cain': 'tainted_cain',
                'judas': 'judas',
                'tainted judas': 'tainted_judas',
                't judas': 'tainted_judas',
                'azazel': 'azazel',
                'tainted forgotten': 'tainted_forgotten_y_soul',
                't forgotten': 'tainted_forgotten_y_soul',
                'tainted forgotten & soul': 'tainted_forgotten_y_soul',
                't forgotten & soul': 'tainted_forgotten_y_soul'
            };
            
            const alternativeId = idVariations[personajeId];
            if (alternativeId) {
                personaje = data[alternativeId];
                console.log('🔄 Usando ID alternativo:', alternativeId);
            }
        }
        
        if (personaje) {
            console.log('✅ Mostrando personaje:', personaje.nombre);
            mostrarPersonaje(personaje);
        } else {
            console.log('❌ Personaje no encontrado. IDs disponibles:', Object.keys(data));
            mostrarError('Personaje no encontrado');
        }
    } else {
        console.log('⚠️ No se encontró ID en la URL');
        mostrarError('No se especificó un personaje');
    }
}

// Función CORREGIDA para mostrar personajes
function mostrarPersonaje(p) {
    let corazones = "";
    if (p.vida) {
        p.vida.forEach(obj => {
            for (let i = 0; i < obj.cantidad; i++) {
                corazones += `<img src="../objetos/consumibles/corazon ${obj.tipo}.png" width="20">`;
            }
        });
    }
    
    let objetos = "";
    if (p.consumibles) {
        p.consumibles.forEach(obje => {
            objetos += `<img src="../objetos/consumibles/${obje.tipo}.png" width="20"> ${obje.cantidad} `;
        });
    }

    // Actualizar nombre
    document.getElementById("nombre").textContent = p.nombre;
    
    // MANEJO CORREGIDO DE IMÁGENES
    const imagenContainer = document.querySelector('.imagen');
    const imagenElement = document.getElementById("imagen");
    
    if (!imagenContainer) {
        console.error('❌ No se encontró el contenedor de imagen');
        return;
    }
    
    // Si hay múltiples imágenes, reemplazar el contenedor .imagen
    if (Array.isArray(p.imagenes)) {
        console.log(`🖼️ Cargando ${p.imagenes.length} imágenes del personaje`);
        
        // Crear nuevo contenido para el contenedor .imagen
        let imagenesHTML = '';
        p.imagenes.forEach((imagenSrc, index) => {
            imagenesHTML += `<img src="${imagenSrc}" alt="${p.nombre} - Imagen ${index + 1}" class="character-image" width="95">`;
            if (index < p.imagenes.length - 1) {
                imagenesHTML += '<br>';
            }
        });
        
        // Reemplazar todo el contenido del contenedor .imagen
        imagenContainer.innerHTML = imagenesHTML + '<p id="descripcioncorta"></p>';
        
    } else if (p.imagen) {
        // Una sola imagen - usar el elemento img existente
        console.log('🖼️ Cargando 1 imagen del personaje');
        imagenElement.src = p.imagen;
        imagenElement.alt = p.nombre;
    } else {
        // No hay imágenes definidas
        console.warn('⚠️ No se encontraron imágenes para el personaje');
        imagenElement.src = "../objetos/consumibles/corazon vacio.png";
        imagenElement.alt = "Imagen no disponible";
    }
    
    // Actualizar descripción corta (estadísticas)
    const descripcionCorta = document.getElementById("descripcioncorta");
    if (descripcionCorta) {
        descripcionCorta.innerHTML = `
            <table class="table table-bordered mt-3">
                <tr><td colspan="2">${p.descripcioncorta || ''}</td></tr>
                <tr><td colspan="2" class="text-center fw-bold">stats</td></tr>
                <tr>
                    <td><img src="../objetos/consumibles/corazon vacio.png" width="20"> Vida<br> ${corazones}</td>
                    <td><img src="../personajes/statsimg/daño.png" width="20"> Daño <br>${p.daño || 'N/A'}</td>
                </tr>
                <tr>
                    <td><img src="../personajes/statsimg/lagrimas.png" width="20"> Lágrimas <br>${p.lagrimas || 'N/A'}</td>
                    <td><img src="../personajes/statsimg/vel lagrima.png" width="20"> Vel. Lágrimas <br>${p.vellagrimas || 'N/A'}</td>
                </tr>
                <tr>
                    <td><img src="../personajes/statsimg/rango.png" width="20"> Rango <br>${p.rango || 'N/A'}</td>
                    <td><img src="../personajes/statsimg/velocidad.png" width="20"> Velocidad<br>${p.velocidad || 'N/A'}</td>
                </tr>
                <tr>
                    <td colspan="2"><img src="../personajes/statsimg/suerte.png" width="20"> Suerte ${p.suerte || 'N/A'}</td>
                </tr>
                <tr>
                    <td colspan="2" class="text-center fw-bold">items iniciales</td>
                </tr>
                <tr>
                    <td>${objetos}</td>
                    <td>${p.objetos ? `<img src="../objetos/objetosimg/${p.objetos}.png" width="20">` : 'N/A'}</td>
                </tr>
            </table>`;
    }
    
    // Actualizar descripción larga
    const descripcionLarga = document.getElementById("descripcionlarga");
    if (descripcionLarga) {
        descripcionLarga.innerHTML = p.descripcionlarga || '';
    }
    
    document.title = `${p.nombre} | The Isaac Wiki`;
    console.log('✅ Personaje mostrado correctamente');
}

function mostrarError(mensaje = "Personaje no encontrado") {
    const wrapper = document.querySelector('.wrapper');
    if (wrapper) {
        wrapper.innerHTML = `
            <div class="text-center py-5">
                <h2 class="text-danger">❌ ${mensaje}</h2>
                <p class="text-muted">El personaje que buscas no existe o no está disponible.</p>
                <a href="personajes.html" class="btn btn-primary mt-3">Volver a personajes</a>
            </div>
        `;
    }
    document.title = "Error | The Isaac Wiki";
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM cargado, inicializando página de personaje...');
    initializePersonajePage();
});