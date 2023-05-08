var urlBase = 'https://script.google.com/macros/s/AKfycbwNa7BS56b1HbPxP1Sl-8JI4tN2SzArRmuo-_w5Ev1qV_hJzJI0FQmbWZbPVCIcHmfc/exec';

window.onload = (e) => {
    initPanel();
};

/*----------------------------------------------------------------
    Funcione del panel de control.
----------------------------------------------------------------*/
function initPanel()
{
    document.querySelector("#input-range").onkeyup = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            getDataTable();
        }
    };
    document.querySelector("#button-download-table-data").onclick = getDataTable;
    document.querySelector(".btn_ultimas_tres_filas").onclick = getUltimasTresFilas;
}

async function getUltimasTresFilas()
{
    var rango = document.querySelector("#input-range");
    rango.value = "-3:-1";
    getDataTable();
}

async function getDataTable() {
    try {
        showOnLoad(true);
        var cabecerasPromise = await fetch(`${urlBase}?read=(1,1:end)`);
        var cabeceras = await cabecerasPromise.text();
        var rowsPromise = await fetch(`${urlBase}?read=rows`);
        var filas = await rowsPromise.text();
        filas = Number(filas);
        var startRow, endRow;
        var rango = document.querySelector("#input-range").value;
        if (rango == "") {
            alert("ingrese datos validos.");
            showOnLoad(false);
            return;
        }else{
            if (rango.includes(" ")) {
                alert("Los dato no deben contener espacios");
                showOnLoad(false);
                return;
            } else {
                if (rango.includes(":")) {
                    [startRow, endRow] = rango.split(":");
                    startRow = Number(startRow) + 1;
                    endRow = Number(endRow) + 1;
                    if (startRow <= 0)
                        startRow += filas;
                    if (endRow <= 0)
                        endRow += filas;
                }else {
                    var fila = Number(rango)+1;
                    if (fila <= 0)
                        fila += filas;
                    startRow = endRow = fila;
                }
            }
        }
        var url = `${urlBase}?read=(${startRow}:${endRow},1:end)`;
        console.log(url);
        var dataTablePromise = await fetch(url);
        var csv = cabeceras;
        var dataTable = await dataTablePromise.text();
        if (dataTable.toLocaleLowerCase() == "la peticion invalida." || dataTable.toLocaleLowerCase() == "rango invalido") {
            setTableHeader([dataTable]);
            clearTableContent();
            showTable(true);
            showOnLoad(false);
            return;
        }
        csv += dataTable;
        var matriz = converCSVtoArray(csv);
        clearTableContent();
        crearTablaConMatriz(matriz);
        showTable(true);
        showOnLoad(false);
    } catch (error) {
        console.log(error);
        showOnLoad(false);
    }
}

function converCSVtoArray(csv) {
    var tabla = [];
    csv = csv.replace(/\s$/,"");
    var filas = csv.split('\n');
    filas.forEach( (fila) => {
        fila = fila.replace(/;$/,"");
        var celdas = fila.split(';');
        tabla.push(celdas);
    });
    return tabla;
}

function crearTablaConMatriz(matriz) {
    console.log(matriz);
    var cabeceras = matriz.shift();
    setTableHeader(cabeceras);
    matriz.forEach( (fila) => {
        addRow(fila);
    });
}



/*----------------------------------------------------------------
    funciones para el manejo de la tabla.
----------------------------------------------------------------*/

function addRow(lista)
{
    var tableBody = document.querySelector(".table-body");
    var newRow = "<tr>"
    lista.forEach(element => {
        newRow += '<td class="text-left">'+element+'</td>';
    });
    newRow += "</tr>";
    tableBody.innerHTML += newRow;
}

function setTableHeader(lista)
{
    var theader = document.querySelector(".my-table thead");
    var newHeader = "<tr>";
    lista.forEach(element => {
        newHeader += '<th class="text-left">'+element+'</th>';
    });
    newHeader += "</tr>";
    theader.innerHTML = newHeader;
}

function clearTableContent()
{
    var tbody = document.querySelector(".my-table tbody");
    tbody.innerHTML = "";
}


/*----------------------------------------------------------------
    Mostrar u oculatar Secciones de la pagina web.
----------------------------------------------------------------*/

function showOnLoad(show)
{
    var onload = document.querySelector(".loading-section");
    if (show)
        onload.style.display = "block";
    else
        onload.style.display = "none";
}

function showTable(show)
{
    var element = document.querySelector(".table-container");
    if (show)
        element.style.display = "block";
    else
        element.style.display = "none";
}
