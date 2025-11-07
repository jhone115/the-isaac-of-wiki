// search-index.js - Carga dinámica de datos desde archivos JSON
class SearchIndex {
    constructor() {
        this.data = {
            objetos: {},
            personajes: {},
            pisos: {}
        };
        this.isLoaded = false;
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
            const response = await fetch('objetos/objetosData.json');
            const data = await response.json();
            
            // Procesar objetos
            for (const [id, nombreKey] of Object.entries(data.nombres)) {
                const detalle = data.detallesObjetos[nombreKey];
                if (detalle) {
                    this.data.objetos[nombreKey] = {
                        id: nombreKey,
                        nombre: detalle.nombre,
                        descripcion: detalle.descripcion,
                        tipo: detalle.tipo || 'Pasivo',
                        imagen: `objetos/objetosimg/collectibles_${id.padStart(3, '0')}_${nombreKey}.png`,
                        categoria: 'objeto',
                        ruta: `objetos/objeto.html?id=${nombreKey}`
                    };
                }
            }
        } catch (error) {
            console.error('Error cargando objetos:', error);
        }
    }

    async loadPersonajes() {
        try {
            const response = await fetch('personajes/personajes_data.json');
            const data = await response.json();
            
            // Procesar personajes
            for (const [key, personaje] of Object.entries(data)) {
                this.data.personajes[key] = {
                    id: key,
                    nombre: personaje.nombre,
                    descripcion: personaje.descripcioncorta,
                    imagen: Array.isArray(personaje.imagen) ? personaje.imagen[0] : personaje.imagen,
                    categoria: 'personaje',
                    ruta: `personajes/personaje.html?id=${key}`
                };
            }
        } catch (error) {
            console.error('Error cargando personajes:', error);
        }
    }

    async loadPisos() {
        try {
            const response = await fetch('pisos/piso.Data.json');
            const data = await response.json();
            
            // Procesar pisos
            for (const [key, piso] of Object.entries(data.informacionPisos)) {
                this.data.pisos[key] = {
                    id: key,
                    nombre: piso.nombre,
                    descripcion: piso.descripcion,
                    imagen: data.fondosPisos[key] || 'pisos/pisosimagenes/basement.jpeg',
                    categoria: 'piso',
                    ruta: `pisos/piso.html?id=${key}`
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