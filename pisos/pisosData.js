// pisosData.js - Carga y gestión de datos de pisos
let pisosData = null;

async function cargarDatosPisos() {
    try {
        const response = await fetch('pisos/pisosData.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar el JSON');
        }
        pisosData = await response.json();
        return pisosData;
    } catch (error) {
        console.error('Error cargando datos de pisos:', error);
        // Fallback: datos mínimos para que la app funcione
        return {
            fondosPisos: {},
            informacionPisos: {}
        };
    }
}