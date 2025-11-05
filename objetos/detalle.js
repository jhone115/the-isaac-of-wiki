// detalle.js - Carga asíncrona de datos
const contenedor = document.getElementById("contenedor-detalle");

const iconosStats = {
    "lagrimas": "../personajes/statsimg/lagrimas.png",
    "vel lagrimas": "../personajes/statsimg/vel lagrima.png",
    "damage": "../personajes/statsimg/daño.png",
    "velocidad": "../personajes/statsimg/velocidad.png",
    "rango": "../personajes/statsimg/rango.png",
    "suerte": "../personajes/statsimg/suerte.png",
    "vida": "../objetos/consumibles/corazon vacio.png"
};

const iconosPools = {
    "Treasure Room": "../objetos/pools/Treasure pool.png",
    "Cursed Room": "../objetos/pools/cursed pool.png",
    "Boss Room": "../objetos/pools/boss pool.png",
    "Shop": "../objetos/pools/shop pool.png",
    "Secret Room": "../objetos/pools/secret pool.png",
    "Devil Room": "../objetos/pools/devil pool.png",
    "Angel Room": "../objetos/pools/angel pool.png",
    "Crane game": "../objetos/pools/crane game pool.png"
};

function renderDetalleObjeto(detalle, id) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("detalle-objeto");

    const tabla = document.createElement("table");
    tabla.classList.add("tabla-stats");

    const filaImg = document.createElement("tr");
    const celdaImg = document.createElement("td");
    celdaImg.colSpan = 2;
    const img = document.createElement("img");
    img.src = `objetosimg/${id}.png`;
    img.alt = detalle.nombre;
    img.width = 60;
    celdaImg.appendChild(img);
    filaImg.appendChild(celdaImg);
    tabla.appendChild(filaImg);

    const filaTipo = document.createElement("tr");
    const celdaTipo = document.createElement("td");
    celdaTipo.colSpan = 2;
    celdaTipo.textContent = detalle.tipo;
    filaTipo.appendChild(celdaTipo);
    tabla.appendChild(filaTipo);

    if (detalle.stats && Array.isArray(detalle.stats)) {
        detalle.stats.forEach(stat => {
            const filaStat = document.createElement("tr");
            const celdaStat = document.createElement("td");
            celdaStat.colSpan = 2;

            const iconoSrc = iconosStats[stat.tipo.toLowerCase()];
            if (iconoSrc) {
                const imgStat = document.createElement("img");
                imgStat.src = iconoSrc;
                imgStat.alt = stat.tipo;
                imgStat.classList.add("icono-stat");
                celdaStat.appendChild(imgStat);
            }

            const textoValor = document.createElement("span");
            textoValor.textContent = ` ${stat.cambio}`;
            celdaStat.appendChild(textoValor);

            filaStat.appendChild(celdaStat);
            tabla.appendChild(filaStat);
        });
    }

    if (detalle.pools && Array.isArray(detalle.pools)) {
        detalle.pools.forEach(poolName => {
            const filaPool = document.createElement("tr");
            const celdaPool = document.createElement("td");
            celdaPool.colSpan = 2;

            const iconoPool = iconosPools[poolName];
            if (iconoPool) {
                const imgPool = document.createElement("img");
                imgPool.src = iconoPool;
                imgPool.alt = poolName;
                imgPool.classList.add("icono-pool");
                celdaPool.appendChild(imgPool);
            }

            const textoPool = document.createElement("span");
            textoPool.textContent = ` ${poolName}`;
            celdaPool.appendChild(textoPool);

            filaPool.appendChild(celdaPool);
            tabla.appendChild(filaPool);
        });
    }

    const panel = document.createElement("div");
    panel.classList.add("panel-descripcion");
    const titulo = document.createElement("h2");
    titulo.textContent = detalle.nombre;
    const descripcion = document.createElement("p");
    descripcion.textContent = detalle.descripcion;
    const efecto = document.createElement("p");
    efecto.innerHTML = `<strong>Efecto:</strong> ${detalle.efecto}`;
    const unlock = document.createElement("p");
    unlock.innerHTML = `<strong>Desbloqueo:</strong> ${detalle.unlock || "—"}`;

    panel.appendChild(titulo);
    panel.appendChild(descripcion);
    panel.appendChild(efecto);
    panel.appendChild(unlock);

    wrapper.appendChild(tabla);
    wrapper.appendChild(panel);
    contenedor.appendChild(wrapper);
}

async function inicializarDetalle() {
    const datos = await cargarDatosObjetos();
    if (!datos) {
        contenedor.textContent = "Error cargando datos del objeto.";
        return;
    }

    const { detallesObjetos } = datos;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id) {
        const key = id.split("_").slice(2).join("_"); 
        const detalle = detallesObjetos[key];
        if (detalle) {
            renderDetalleObjeto(detalle, id);
        } else {
            contenedor.textContent = "Objeto no encontrado.";
        }
    } else {
        contenedor.textContent = "Ningún objeto seleccionado.";
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarDetalle);
} else {
    inicializarDetalle();
}