// search.js - Lógica principal de búsqueda
class SearchManager {
    constructor() {
        this.config = {
            minQueryLength: 2,
            maxResults: 20,
            debounceTime: 300
        };
        
        this.state = {
            currentQuery: '',
            isSearching: false,
            lastSearchTime: 0
        };
        
        this.modal = null;
        this.initialize();
    }

    initialize() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');

        if (!searchForm || !searchInput) {
            console.error('Elementos de búsqueda no encontrados');
            return;
        }

        // Evento de envío del formulario
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.performSearch(searchInput.value.trim());
        });

        // Búsqueda en tiempo real con debounce
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();
            
            if (query.length >= this.config.minQueryLength) {
                debounceTimer = setTimeout(() => {
                    this.performSearch(query);
                }, this.config.debounceTime);
            } else if (query.length === 0) {
                this.clearSearchResults();
            }
        });

        // Inicializar modal de Bootstrap
        this.initializeModal();
    }

    initializeModal() {
        const modalElement = document.getElementById('searchResultsModal');
        if (modalElement && typeof bootstrap !== 'undefined') {
            this.modal = new bootstrap.Modal(modalElement);
            
            // Focus en el input cuando se abre el modal
            modalElement.addEventListener('shown.bs.modal', () => {
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.focus();
            });
        }
    }

    async performSearch(query) {
        if (!query || query.length < this.config.minQueryLength) {
            this.clearSearchResults();
            return;
        }

        // Evitar búsquedas duplicadas rápidas
        const now = Date.now();
        if (now - this.state.lastSearchTime < 200 && query === this.state.currentQuery) {
            return;
        }

        this.state.currentQuery = query;
        this.state.lastSearchTime = now;
        this.state.isSearching = true;

        this.showLoadingState();

        // Esperar un poco para evitar flickering en búsquedas rápidas
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const results = searchIndex.search(query.toLowerCase());
            this.displaySearchResults(results, query);
        } catch (error) {
            console.error('Error en búsqueda:', error);
            this.showErrorState();
        } finally {
            this.state.isSearching = false;
        }
    }

    displaySearchResults(results, query) {
        const resultsBody = document.getElementById('search-results-body');
        if (!resultsBody) return;

        const totalResults = results.objetos.length + results.personajes.length + results.pisos.length;

        if (totalResults === 0) {
            this.showNoResults(query);
            return;
        }

        let html = `<div class="search-result-count">Se encontraron ${totalResults} resultados para "${query}"</div>`;

        // Mostrar objetos
        if (results.objetos.length > 0) {
            html += `<h6 class="category-title">Objetos (${results.objetos.length})</h6>`;
            results.objetos.slice(0, this.config.maxResults).forEach(item => {
                html += this.createResultItemHTML(item);
            });
        }

        // Mostrar personajes
        if (results.personajes.length > 0) {
            html += `<h6 class="category-title">Personajes (${results.personajes.length})</h6>`;
            results.personajes.slice(0, this.config.maxResults).forEach(item => {
                html += this.createResultItemHTML(item);
            });
        }

        // Mostrar pisos
        if (results.pisos.length > 0) {
            html += `<h6 class="category-title">Pisos (${results.pisos.length})</h6>`;
            results.pisos.slice(0, this.config.maxResults).forEach(item => {
                html += this.createResultItemHTML(item);
            });
        }

        resultsBody.innerHTML = html;
        this.attachResultClickHandlers();
        
        // Mostrar el modal
        this.showModal();
    }

    createResultItemHTML(item) {
        const typeClass = `type-${item.categoria}`;
        const highlightedName = this.highlightMatches(item.nombre, this.state.currentQuery);
        const highlightedDesc = this.highlightMatches(item.descripcion, this.state.currentQuery);
        
        return `
            <div class="search-result-item d-flex align-items-center" 
                 data-id="${item.id}" 
                 data-type="${item.categoria}"
                 data-ruta="${item.ruta}">
                <img src="${item.imagen}" alt="${item.nombre}" 
                     class="search-item-image" 
                     onerror="this.src='favicon.png'; this.onerror=null;">
                <div class="search-item-content">
                    <div class="search-item-title">${highlightedName}</div>
                    <div class="search-item-description">${highlightedDesc}</div>
                    <div class="mt-2">
                        <span class="search-item-type ${typeClass}">${this.getTypeLabel(item.categoria)}</span>
                        ${item.tipo ? `<span class="search-item-type">${item.tipo}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    highlightMatches(text, query) {
        if (!text || !query) return text;
        
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    getTypeLabel(type) {
        const labels = {
            'objeto': 'Objeto',
            'personaje': 'Personaje', 
            'piso': 'Piso'
        };
        return labels[type] || type;
    }

    attachResultClickHandlers() {
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const id = item.dataset.id;
                const type = item.dataset.type;
                const ruta = item.dataset.ruta;
                this.navigateToItem(id, type, ruta);
            });
        });
    }

    navigateToItem(id, type, ruta) {
        if (ruta) {
            this.hideModal();
            window.location.href = ruta;
        }
    }

    showLoadingState() {
        const resultsBody = document.getElementById('search-results-body');
        if (resultsBody) {
            resultsBody.innerHTML = `
                <div class="search-loading">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Buscando...</span>
                    </div>
                    <p class="mt-2">Buscando "${this.state.currentQuery}"...</p>
                </div>
            `;
        }
        this.showModal();
    }

    showNoResults(query) {
        const resultsBody = document.getElementById('search-results-body');
        if (resultsBody) {
            resultsBody.innerHTML = `
                <div class="search-no-results">
                    <i>🔍</i>
                    <h5>No se encontraron resultados</h5>
                    <p>No hay resultados para "${query}". Intenta con otros términos.</p>
                    <small class="text-muted">Busca por nombre de objeto, personaje o piso</small>
                </div>
            `;
        }
        this.showModal();
    }

    showErrorState() {
        const resultsBody = document.getElementById('search-results-body');
        if (resultsBody) {
            resultsBody.innerHTML = `
                <div class="search-no-results">
                    <i>⚠️</i>
                    <h5>Error en la búsqueda</h5>
                    <p>Ha ocurrido un error al realizar la búsqueda. Intenta nuevamente.</p>
                </div>
            `;
        }
        this.showModal();
    }

    clearSearchResults() {
        const resultsBody = document.getElementById('search-results-body');
        if (resultsBody) {
            resultsBody.innerHTML = '';
        }
    }

    showModal() {
        if (this.modal) {
            this.modal.show();
        }
    }

    hideModal() {
        if (this.modal) {
            this.modal.hide();
        }
    }
}

// Inicializar el gestor de búsqueda cuando se cargue la página
let searchManager;

document.addEventListener('DOMContentLoaded', function() {
    searchManager = new SearchManager();
});