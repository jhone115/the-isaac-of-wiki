// objetos.js - VERSIÓN MEJORADA CON RESPONSIVE
const tabla = document.getElementById("contenedor-detalle");
const grid = document.getElementById("contenedor-grid");

async function inicializarObjetos() {
    const datos = await cargarDatosObjetos();
    if (!datos) {
        tabla.innerHTML = "<tr><td colspan='4'>Error cargando datos</td></tr>";
        grid.innerHTML = "<div class='objeto-card'>Error cargando datos</div>";
        return;
    }

    const { objetos, nombres, detallesObjetos } = datos;

    // Limpiar contenedores
    tabla.innerHTML = '';
    grid.innerHTML = '';

    objetos.forEach(num => {
        const key = nombres[num];
        const detalle = detallesObjetos[key];
        const id = `collectibles_${num}_${key}`;

        // Versión tabla (escritorio)
        const fila = document.createElement("tr");

        // Nombre con enlace
        const celdaNombre = document.createElement("td");
        const enlaceNombre = document.createElement("a");
        enlaceNombre.href = `objeto.html?id=${id}`;
        enlaceNombre.textContent = detalle ? detalle.nombre : key;
        enlaceNombre.style.textDecoration = "none";
        enlaceNombre.style.color = "inherit";
        celdaNombre.appendChild(enlaceNombre);
        fila.appendChild(celdaNombre);

        // ID
        const celdaID = document.createElement("td");
        celdaID.textContent = num;
        fila.appendChild(celdaID);

        // Imagen con enlace
        const celdaIcono = document.createElement("td");
        const enlaceIcono = document.createElement("a");
        enlaceIcono.href = `objeto.html?id=${id}`;
        const img = document.createElement("img");
        img.src = `objetosimg/${id}.png`;
        img.alt = key;
        img.style.width = "40px";
        img.style.height = "40px";
        enlaceIcono.appendChild(img);
        celdaIcono.appendChild(enlaceIcono);
        fila.appendChild(celdaIcono);

        // Descripción breve
        const celdaDescripcion = document.createElement("td");
        celdaDescripcion.textContent = detalle ? detalle.descripcion : "Sin descripción aún.";
        fila.appendChild(celdaDescripcion);

        tabla.appendChild(fila);

        // Versión tarjeta (móviles)
        const card = document.createElement("div");
        card.className = "objeto-card";
        
        const cardHeader = document.createElement("div");
        cardHeader.className = "objeto-card-header";
        
        const cardImg = document.createElement("img");
        cardImg.src = `objetosimg/${id}.png`;
        cardImg.alt = key;
        cardImg.className = "objeto-card-img";
        
        const cardInfo = document.createElement("div");
        cardInfo.className = "objeto-card-info";
        
        const cardName = document.createElement("a");
        cardName.href = `objeto.html?id=${id}`;
        cardName.className = "objeto-card-name";
        cardName.textContent = detalle ? detalle.nombre : key;
        
        const cardId = document.createElement("p");
        cardId.className = "objeto-card-id";
        cardId.textContent = `ID: ${num}`;
        
        const cardDescription = document.createElement("p");
        cardDescription.className = "objeto-card-description";
        cardDescription.textContent = detalle ? detalle.descripcion : "Sin descripción aún.";
        
        cardInfo.appendChild(cardName);
        cardInfo.appendChild(cardId);
        cardHeader.appendChild(cardImg);
        cardHeader.appendChild(cardInfo);
        card.appendChild(cardHeader);
        card.appendChild(cardDescription);
        
        grid.appendChild(card);
    });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarObjetos);
} else {
    inicializarObjetos();
}