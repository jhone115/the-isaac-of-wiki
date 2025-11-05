// Este archivo carga los datos desde el JSON
let objetosData = {};

async function cargarDatosObjetos() {
    try {
        const response = await fetch('objetosData.json');
        objetosData = await response.json();
        return objetosData;
    } catch (error) {
        console.error('Error cargando datos de objetos:', error);
        return null;
    }
}

// Función para normalizar claves (mantenida de tu código original)
function normalizeKey(str) {
    return String(str)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9_]/g, "");
}