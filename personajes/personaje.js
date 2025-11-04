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

// Función principal
async function initializePersonajePage() {
    console.log('🚀 Inicializando página...');
    
    const params = new URLSearchParams(window.location.search);
    let personajeId = params.get("id");
    console.log('📝 Personaje ID desde URL:', personajeId);

    if (personajeId) {
        personajeId = personajeId.toLowerCase().trim();
        
        const data = await cargarDatosPersonajes();
        
        if (!data) {
            return;
        }
        
        console.log('📊 Datos disponibles:', Object.keys(data));
        
        let personaje = data[personajeId];
        
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
                't forgotten & soul': 'tainted_forgotten_y_soul',
                'jacob & esau': 'jacob_esau',
                'jacob and esau': 'jacob_esau',
                'jacob': 'jacob_esau',
                'esau': 'jacob_esau'
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
            console.log('❌ Personaje no encontrado');
            mostrarError('Personaje no encontrado');
        }
    } else {
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
    
    // MANEJO CORREGIDO DE IMÁGENES MÚLTIPLES
    const imagenContainer = document.querySelector('.imagen');
    
    if (!imagenContainer) {
        console.error('❌ No se encontró el contenedor de imagen');
        return;
    }
    
    // Limpiar y reconstruir el contenedor de imagen manteniendo la estructura
    imagenContainer.innerHTML = '<div id="imagenes-multiples"></div><p id="descripcioncorta"></p>';
    
    const imagenesMultiples = document.getElementById('imagenes-multiples');
    const descripcionCorta = document.getElementById("descripcioncorta");
    
    // Determinar qué imágenes mostrar
    let imagenes = [];
    
    if (Array.isArray(p.imagenes)) {
        // Caso 1: Array de imágenes
        imagenes = p.imagenes;
        console.log(`🖼️ Cargando ${imagenes.length} imágenes desde array`);
    } else if (p.imagen && p.imagen.includes(',')) {
        // Caso 2: String con comas (compatibilidad)
        imagenes = p.imagen.split(',').map(img => img.trim());
        console.log(`🖼️ Cargando ${imagenes.length} imágenes desde string dividido`);
    } else if (p.imagen) {
        // Caso 3: Una sola imagen
        imagenes = [p.imagen];
        console.log('🖼️ Cargando 1 imagen');
    }
    
    // Mostrar las imágenes
    if (imagenes.length > 0) {
        imagenes.forEach((imagenSrc, index) => {
            const img = document.createElement('img');
            img.src = imagenSrc;
            img.alt = `${p.nombre} - Imagen ${index + 1}`;
            img.className = 'character-image';
            img.width = 95;
            img.onerror = function() {
                console.error(`❌ Error cargando imagen: ${imagenSrc}`);
                this.src = "../objetos/consumibles/corazon vacio.png";
            };
            imagenesMultiples.appendChild(img);
            
            // Agregar espacio entre imágenes
            if (index < imagenes.length - 1) {
                imagenesMultiples.appendChild(document.createTextNode(' '));
            }
        });
    } else {
        // Imagen por defecto
        const fallbackImg = document.createElement('img');
        fallbackImg.src = "../objetos/consumibles/corazon vacio.png";
        fallbackImg.alt = "Imagen no disponible";
        fallbackImg.className = "character-image";
        fallbackImg.width = 95;
        imagenesMultiples.appendChild(fallbackImg);
    }
    
    // Actualizar descripción corta (estadísticas)
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