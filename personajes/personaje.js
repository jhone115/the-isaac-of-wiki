// Cache para almacenar los datos cargados
let personajesData = null;

async function cargarDatosPersonajes() {
    if (personajesData) {
        return personajesData;
    }
    
    console.log('🔍 Intentando cargar JSON en GitHub Pages...');
    
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
        console.log('✅ JSON cargado en GitHub Pages');
        
        personajesData = data;
        return personajesData;
        
    } catch (error) {
        console.error(' Error cargando JSON en GitHub Pages:', error);
        console.log(' Usando datos hardcodeados');
        return getDatosHardcodeados();
    }
}

// Función principal MEJORADA con manejo de IDs
async function initializePersonajePage() {
    console.log(' Inicializando página...');
    
    const params = new URLSearchParams(window.location.search);
    let personajeId = params.get("id");
    console.log(' Personaje ID desde URL:', personajeId);

    if (personajeId) {
        // Normalizar el ID (minúsculas, sin espacios, etc.)
        personajeId = personajeId.toLowerCase().trim();
        
        const data = await cargarDatosPersonajes();
        console.log(' Datos disponibles:', Object.keys(data));
        
        // Buscar el personaje - probar diferentes variaciones del ID
        let personaje = data[personajeId];
        
        // Si no se encuentra, probar alternativas
        if (!personaje) {
            console.log(' Buscando variaciones del ID...');
            
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
                'azazel': 'azazel'
            };
            
            const alternativeId = idVariations[personajeId];
            if (alternativeId) {
                personaje = data[alternativeId];
                console.log('🔄 Usando ID alternativo:', alternativeId);
            }
        }
        
        if (personaje) {
            console.log(' Mostrando personaje:', personaje.nombre);
            mostrarPersonaje(personaje);
        } else {
            console.log(' Personaje no encontrado. IDs disponibles:', Object.keys(data));
            mostrarError();
        }
    } else {
        console.log(' No se encontró ID en la URL');
    }
}

// Las otras funciones se mantienen igual...
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
    document.getElementById("imagen").src = p.imagen;
    
    document.getElementById("descripcioncorta").innerHTML = `
        <table>
            <tr><td colspan="2">${p.descripcioncorta}</td></tr>
            <tr><td colspan="2">stats</td></tr>
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
                <td colspan="2">items iniciales</td>
            </tr>
            <tr>
                <td> ${objetos}</td>
                <td><img src="../objetos/objetosimg/${p.objetos}.png" width="20"></td>
            </tr>
        </table>`;
    
    document.getElementById("descripcionlarga").innerHTML = p.descripcionlarga;
    document.title = `${p.nombre} | The Isaac Wiki`;
}

function mostrarError() {
    document.body.innerHTML = "<h1>Personaje no encontrado</h1>";
    document.title = "Personaje no encontrado";
}

document.addEventListener('DOMContentLoaded', initializePersonajePage);