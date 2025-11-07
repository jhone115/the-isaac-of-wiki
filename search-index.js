// search-index.js - Carga dinámica de datos desde archivos JSON (VERSIÓN MEJORADA)
class SearchIndex {
    constructor() {
        this.data = {
            objetos: {},
            personajes: {},
            pisos: {}
        };
        this.isLoaded = false;
        this.basePath = this.detectBasePath();
        console.log('Base path detectado:', this.basePath);
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
        console.log('Iniciando carga de todos los datos...');
        try {
            await Promise.all([
                this.loadObjetos(),
                this.loadPersonajes(),
                this.loadPisos()
            ]);
            this.isLoaded = true;
            console.log('✅ Todos los datos de búsqueda cargados correctamente');
            console.log('Resumen:', {
                objetos: Object.keys(this.data.objetos).length,
                personajes: Object.keys(this.data.personajes).length,
                pisos: Object.keys(this.data.pisos).length
            });
        } catch (error) {
            console.error('❌ Error cargando datos de búsqueda:', error);
        }
    }

    async loadObjetos() {
        try {
            const url = `${this.basePath}objetos/objetosData.json`;
            console.log('Cargando objetos desde:', url);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            // Procesar objetos
            for (const [id, nombreKey] of Object.entries(data.nombres)) {
                const detalle = data.detallesObjetos[nombreKey];
                if (detalle) {
                    // Múltiples formatos posibles para las imágenes
                    const posiblesImagenes = [
                        `${this.basePath}objetos/objetosimg/collectibles_${id.padStart(3, '0')}_${nombreKey}.png`,
                        `${this.basePath}objetos/objetosimg/collectibles_${id}_${nombreKey}.png`,
                        `${this.basePath}objetos/objetosimg/${nombreKey}.png`,
                        `${this.basePath}objetos/objetosimg/collectibles_${id.padStart(3, '0')}.png`,
                        `${this.basePath}objetos/objetosimg/collectibles_${id}.png`,
                        `${this.basePath}objetos/objetosimg/${id}_${nombreKey}.png`
                    ];

                    // Usar el formato completo para el ID en la URL
                    const objetoIdCompleto = `collectibles_${id}_${nombreKey}`;
                    
                    this.data.objetos[nombreKey] = {
                        id: nombreKey,
                        idCompleto: objetoIdCompleto,
                        nombre: detalle.nombre,
                        descripcion: detalle.descripcion,
                        tipo: detalle.tipo || 'Pasivo',
                        imagen: posiblesImagenes[0],
                        imagenesAlternativas: posiblesImagenes,
                        categoria: 'objeto',
                        ruta: `${this.basePath}objetos/objeto.html?id=${objetoIdCompleto}`
                    };
                }
            }
            console.log(`✅ Objetos cargados: ${Object.keys(this.data.objetos).length}`);
        } catch (error) {
            console.error('❌ Error cargando objetos:', error);
        }
    }

    async loadPersonajes() {
        try {
            const url = `${this.basePath}personajes/personajes_data.json`;
            console.log('Cargando personajes desde:', url);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
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
            console.log(`✅ Personajes cargados: ${Object.keys(this.data.personajes).length}`);
        } catch (error) {
            console.error('❌ Error cargando personajes:', error);
        }
    }

    async loadPisos() {
        try {
            const url = `${this.basePath}pisos/piso.Data.json`;
            console.log('Cargando pisos desde:', url);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            console.log('Estructura del JSON de pisos:', Object.keys(data));
            
            // Verificar estructura esperada
            if (!data.informacionPisos) {
                console.error('❌ El JSON de pisos no tiene la propiedad "informacionPisos"');
                console.log('Propiedades disponibles:', Object.keys(data));
                return;
            }
            
            // Procesar pisos
            let pisosCargados = 0;
            for (const [key, piso] of Object.entries(data.informacionPisos)) {
                const fondo = data.fondosPisos ? data.fondosPisos[key] : null;
                
                this.data.pisos[key] = {
                    id: key,
                    nombre: piso.nombre,
                    descripcion: piso.descripcion,
                    imagen: fondo ? `${this.basePath}${fondo}` : `${this.basePath}pisos/pisosimagenes/basement.jpeg`,
                    categoria: 'piso',
                    ruta: `${this.basePath}pisos/piso.html?id=${key}`
                };
                pisosCargados++;
            }
            
            console.log(`✅ Pisos cargados: ${pisosCargados}`);
            if (pisosCargados > 0) {
                console.log('Ejemplo de piso cargado:', this.data.pisos[Object.keys(this.data.pisos)[0]]);
            }
            
        } catch (error) {
            console.error('❌ Error cargando pisos:', error);
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
        console.log(`Buscando "${searchTerm}" en:`, {
            objetos: Object.keys(this.data.objetos).length,
            personajes: Object.keys(this.data.personajes).length,
            pisos: Object.keys(this.data.pisos).length
        });

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

        console.log('Resultados de búsqueda:', {
            objetos: results.objetos.length,
            personajes: results.personajes.length,
            pisos: results.pisos.length
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
    console.log('DOM cargado, iniciando carga de datos...');
    searchIndex.loadAllData();
});