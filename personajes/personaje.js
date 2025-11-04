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
            return; // Error ya manejado en cargarDatosPersonajes
        }
        
        console.log('📊 Datos disponibles:', Object.keys(data));
        
        // Buscar el personaje - probar diferentes variaciones del ID
        let personaje = data[personajeId];
        
        // Si no se encuentra, probar alternativas
        if (!personaje) {
            console.log('🔍 Buscando variaciones del ID...');
            
            // Mapeo de IDs alternativos
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

// Función MEJORADA para mostrar personajes con múltiples imágenes
function mostrarPersonaje(p) {
    let corazones = "";
    p.vida.forEach(obj => {
        for (let i = 0; i < obj.cantidad; i++) {
            corazones += `<img src="../objetos/consumibles/corazon ${obj.tipo}.png" width="20">`;
        }
    });
    
    let objetos = "";
    p.consumibles.forEach(obje => {
        objetos += `<img src="../objetos/consumibles/${obje.tipo}.png" width="20"> ${obje.cantidad} `;
    });

    document.getElementById("nombre").textContent = p.nombre;
    
    // MOSTRAR MÚLTIPLES IMÁGENES - Versión mejorada con compatibilidad
    const imagenContainer = document.getElementById("imagen");
    const descripcionCorta = document.getElementById("descripcioncorta");
    
    if (!imagenContainer) {
        console.error('❌ No se encontró el contenedor de imagen');
        return;
    }
    
    // Limpiar el contenedor de imagen
    imagenContainer.innerHTML = "";
    
    // Manejar tanto array como string individual
    if (Array.isArray(p.imagenes)) {
        // Múltiples imágenes
        console.log(`🖼️ Cargando ${p.imagenes.length} imágenes del personaje`);
        p.imagenes.forEach((imagenSrc, index) => {
            const img = document.createElement("img");
            img.src = imagenSrc;
            img.alt = `${p.nombre} - Imagen ${index + 1}`;
            img.className = "character-image";
            img.width = 95;
            img.onerror = function() {
                console.error(`❌ Error cargando imagen: ${imagenSrc}`);
                this.src = "../objetos/consumibles/corazon vacio.png";
            };
            imagenContainer.appendChild(img);
            
            // Agregar un salto de línea si no es la última imagen
            if (index < p.imagenes.length - 1) {
                imagenContainer.appendChild(document.createElement("br"));
            }
        });
    } else if (p.imagen) {
        // Una sola imagen (compatibilidad hacia atrás)
        console.log('🖼️ Cargando 1 imagen del personaje');
        const img = document.createElement("img");
        img.src = p.imagen;
        img.alt = p.nombre;
        img.className = "character-image";
        img.width = 95;
        img.onerror = function() {
            console.error(`❌ Error cargando imagen: ${p.imagen}`);
            this.src = "../objetos/consumibles/corazon vacio.png";
        };
        imagenContainer.appendChild(img);
    } else {
        // No hay imágenes definidas
        console.warn('⚠️ No se encontraron imágenes para el personaje');
        const fallbackImg = document.createElement("img");
        fallbackImg.src = "../objetos/consumibles/corazon vacio.png";
        fallbackImg.alt = "Imagen no disponible";
        fallbackImg.className = "character-image";
        fallbackImg.width = 95;
        imagenContainer.appendChild(fallbackImg);
    }
    
    // Mostrar estadísticas y descripción
    descripcionCorta.innerHTML = `
        <table class="table table-bordered">
            <tr><td colspan="2">${p.descripcioncorta}</td></tr>
            <tr><td colspan="2" class="text-center fw-bold">stats</td></tr>
            <tr>
                <td><img src="../objetos/consumibles/corazon vacio.png" width="20"> Vida<br> ${corazones}</td>
                <td><img src="../personajes/statsimg/daño.png" width="20"> Daño <br>${p.daño}</td>
            </tr>
            <tr>
                <td><img src="../personajes/statsimg/lagrimas.png" width="20"> Lágrimas <br>${p.lagrimas}</td>
                <td><img src="../personajes/statsimg/vel lagrima.png" width="20"> Vel. Lágrimas <br>${p.vellagrimas}</td>
            </tr>
            <tr>
                <td><img src="../personajes/statsimg/rango.png" width="20"> Rango <br>${p.rango}</td>
                <td><img src="../personajes/statsimg/velocidad.png" width="20"> Velocidad<br>${p.velocidad}</td>
            </tr>
            <tr>
                <td colspan="2"><img src="../personajes/statsimg/suerte.png" width="20"> Suerte ${p.suerte}</td>
            </tr>
            <tr>
                <td colspan="2" class="text-center fw-bold">items iniciales</td>
            </tr>
            <tr>
                <td>${objetos}</td>
                <td><img src="../objetos/objetosimg/${p.objetos}.png" width="20"></td>
            </tr>
        </table>`;
    
    document.getElementById("descripcionlarga").innerHTML = p.descripcionlarga;
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