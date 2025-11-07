// search-index.js - Carga dinámica de datos desde archivos JSON (MEJORADO)
class SearchIndex {
    constructor() {
        this.data = {
            objetos: {},
            personajes: {},
            pisos: {}
        };
        this.isLoaded = false;
        this.basePath = this.detectBasePath();
    }

    detectBasePath() {
        // Detectar si estamos en GitHub Pages o local
        const path = window.location.pathname;
        if (path.includes('/the-isaac-of-wiki/')) {
            return '/the-isaac-of-wiki/';
        } else if (path.includes('/docs/')) {
            return '/docs/';
        } else {
            return './';
        }
    }

    async loadAllData() {
        try {
            await Promise.all([
                this.loadObjetos(),
                this.loadPersonajes(),
                this.loadPisos()
            ]);
            this.isLoaded = true;
            console.log('Todos los datos de búsqueda cargados correctamente');
        } catch (error) {
            console.error('Error cargando datos de búsqueda:', error);
        }
    }

    async loadObjetos() {
        try {
            const response = await fetch(`${this.basePath}objetos/objetosData.json`);
            const data = await response.json();
            
            // Procesar objetos
            for (const [id, nombreKey] of Object.entries(data.nombres)) {
                const detalle = data.detallesObjetos[nombreKey];
                if (detalle) {
                    // Múltiples formatos posibles para las imágenes
                    const posiblesImagenes = [
                        // Formato con ID de 3 dígitos y nombre
                        `${this.basePath}objetos/objetosimg/collectibles_${id.padStart(3, '0')}_${nombreKey}.png`,
                        // Formato con ID tal cual y nombre
                        `${this.basePath}objetos/objetosimg/collectibles_${id}_${nombreKey}.png`,
                        // Solo el nombre
                        `${this.basePath}objetos/objetosimg/${nombreKey}.png`,
                        // Solo el ID con 3 dígitos
                        `${this.basePath}objetos/objetosimg/collectibles_${id.padStart(3, '0')}.png`,
                        // Solo el ID tal cual
                        `${this.basePath}objetos/objetosimg/collectibles_${id}.png`,
                        // Formato alternativo común
                        `${this.basePath}objetos/objetosimg/${id}_${nombreKey}.png`
                    ];

                    this.data.objetos[nombreKey] = {
                        id: nombreKey,
                        nombre: detalle.nombre,
                        descripcion: detalle.descripcion,
                        tipo: detalle.tipo || 'Pasivo',
                        imagen: posiblesImagenes[0],
                        imagenesAlternativas: posiblesImagenes,
                        categoria: 'objeto',
                        ruta: `${this.basePath}objetos/objeto.html?id=${nombreKey}`
                    };
                }
            }
        } catch (error) {
            console.error('Error cargando objetos:', error);
        }
    }

    async loadPersonajes() {
        try {
            const response = await fetch(`${this.basePath}personajes/personajes_data.json`);
            const data = await response.json();
            
            // Procesar personajes
            for (const [key, personaje] of Object.entries(data)) {
                let imagenPrincipal;
                if (Array.isArray(personaje.imagen)) {
                    imagenPrincipal = `${this.basePath}${personaje.imagen[0]}`;
                } else {
                    imagenPrincipal = `${this.basePath}${personaje.imagen}`;
                }

                this.data.personajes[key] = {
                    id: key,
                    nombre: personaje.nombre,
                    descripcion: personaje.descripcioncorta,
                    imagen: imagenPrincipal,
                    categoria: 'personaje',
                    ruta: `${this.basePath}personajes/personaje.html?id=${key}`
                };
            }
        } catch (error) {
            console.error('Error cargando personajes:', error);
        }
    }

    async loadPisos() {
        try {
            const response = await fetch(`${this.basePath}pisos/piso.Data.json`);
            const data = await response.json();
            
            // Procesar pisos
            for (const [key, piso] of Object.entries(data.informacionPisos)) {
                const fondo = data.fondosPisos[key];
                this.data.pisos[key] = {
                    id: key,
                    nombre: piso.nombre,
                    descripcion: piso.descripcion,
                    imagen: fondo ? `${this.basePath}${fondo}` : `${this.basePath}pisos/pisosimagenes/basement.jpeg`,
                    categoria: 'piso',
                    ruta: `${this.basePath}pisos/piso.html?id=${key}`
                };
            }
        } catch (error) {
            console.error('Error cargando pisos:', error);
        }
    }

    search(query) {
        if (!query || query.length < 2) {
            return { objetos: [], personajes: [], pisos: [] };
        }

        const results = {
            objetos: [],
            personajes: [],
            pisos: []
        };

        const searchTerm = query.toLowerCase();

        // Buscar en objetos
        Object.values(this.data.objetos).forEach(objeto => {
            if (this.matches(objeto, searchTerm)) {
                results.objetos.push(objeto);
            }
        });

        // Buscar en personajes
        Object.values(this.data.personajes).forEach(personaje => {
            if (this.matches(personaje, searchTerm)) {
                results.personajes.push(personaje);
            }
        });

        // Buscar en pisos
        Object.values(this.data.pisos).forEach(piso => {
            if (this.matches(piso, searchTerm)) {
                results.pisos.push(piso);
            }
        });

        return results;
    }

    matches(item, searchTerm) {
        const searchFields = [
            item.nombre,
            item.descripcion,
            item.tipo
        ].filter(Boolean);

        return searchFields.some(field => 
            field.toLowerCase().includes(searchTerm)
        );
    }

    getItemById(type, id) {
        return this.data[type]?.[id] || null;
    }
}

// Crear instancia global
const searchIndex = new SearchIndex();

// Cargar datos cuando esté listo el DOM
document.addEventListener('DOMContentLoaded', function() {
    searchIndex.loadAllData();
});