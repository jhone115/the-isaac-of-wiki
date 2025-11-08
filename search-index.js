// search-index.js - VERSIÓN MEJORADA PARA TODAS LAS PÁGINAS
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
        // Detectar la ruta base de forma más robusta
        const currentPath = window.location.pathname;
        console.log('Path actual:', currentPath);
        
        // Si estamos en GitHub Pages
        if (currentPath.includes('/the-isaac-of-wiki/')) {
            return '/the-isaac-of-wiki/';
        } else if (currentPath.includes('/docs/')) {
            return '/docs/';
        } else {
            // Para desarrollo local - calcular la ruta base relativa
            const pathSegments = currentPath.split('/').filter(seg => seg && !seg.includes('.html'));
            const levelsUp = pathSegments.length;
            
            if (levelsUp === 0) {
                return './'; // Estamos en la raíz
            } else {
                return '../'.repeat(levelsUp);
            }
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
        } catch (error) {
            console.error('❌ Error cargando datos de búsqueda:', error);
        }
    }

    async loadObjetos() {
        try {
            // Usar ruta relativa que funcione en cualquier página
            const url = `${this.basePath}objetos/objetosData.json`;
            console.log('Cargando objetos desde:', url);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            // Procesar objetos
            for (const [id, nombreKey] of Object.entries(data.nombres)) {
                const detalle = data.detallesObjetos[nombreKey];
                if (detalle) {
                    const objetoIdCompleto = `collectibles_${id}_${nombreKey}`;
                    
                    this.data.objetos[nombreKey] = {
                        id: nombreKey,
                        idCompleto: objetoIdCompleto,
                        nombre: detalle.nombre,
                        descripcion: detalle.descripcion,
                        tipo: detalle.tipo || 'Pasivo',
                        imagen: `${this.basePath}objetos/objetosimg/${objetoIdCompleto}.png`,
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
                    imagenPrincipal = `${this.basePath}personajes/${personaje.imagen[0]}`;
                } else {
                    imagenPrincipal = `${this.basePath}personajes/${personaje.imagen}`;
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
            const url = `${this.basePath}pisos/pisosData.json`;
            console.log('Cargando pisos desde:', url);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            // Procesar pisos
            for (const [key, piso] of Object.entries(data.informacionPisos)) {
                const fondo = data.fondosPisos ? data.fondosPisos[key] : null;
                
                this.data.pisos[key] = {
                    id: key,
                    nombre: piso.nombre,
                    descripcion: piso.descripcion,
                    imagen: fondo ? `pisos/${fondo}` : `${this.basePath}pisos/pisosimagenes/basement.jpeg`,
                    categoria: 'piso',
                    ruta: `${this.basePath}pisos/piso.html?piso=${key}`
                };
            }
            console.log(`✅ Pisos cargados: ${Object.keys(this.data.pisos).length}`);
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
}

// Crear instancia global
const searchIndex = new SearchIndex();

// Cargar datos cuando esté listo el DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando carga de datos...');
    searchIndex.loadAllData();
});