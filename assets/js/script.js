alert('enlace completo')
const url = 'https://mindicador.cl/api';
async function obtenerIndicadores() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('No se pudo obtener los indicadores económicos');
        }
        
        const dailyIndicators = await response.json();
        mostrarIndicadores(dailyIndicators);
    } catch (error) {
        console.error('Error al obtener los indicadores económicos:', error.message);
    }
}
function mostrarIndicadores(dailyIndicators) {
    document.getElementById("UF").innerHTML = 'El valor actual de la UF es $' + dailyIndicators.uf.valor;
    document.getElementById("DolarO").innerHTML = 'El valor actual del Dólar observado es $' + dailyIndicators.dolar.valor;
    document.getElementById("DolarA").innerHTML = 'El valor actual del Dólar acuerdo es $' + dailyIndicators.dolar_intercambio.valor;
    document.getElementById("Euro").innerHTML = 'El valor actual del Euro es $' + dailyIndicators.euro.valor;
    document.getElementById("IPC").innerHTML = 'El valor actual del IPC es ' + dailyIndicators.ipc.valor + '%';
    document.getElementById("UTM").innerHTML = 'El valor actual de la UTM es $' + dailyIndicators.utm.valor;
    document.getElementById("IVP").innerHTML = 'El valor actual del IVP es $' + dailyIndicators.ivp.valor;
    document.getElementById("Imacec").innerHTML = 'El valor actual del Imacec es ' + dailyIndicators.imacec.valor + '%';
}
async function convertirMoneda() {
    const cantidadPesos = parseFloat(document.getElementById('cantidadPesos').value);
    const monedaDestino = document.getElementById('monedaDestino').value;

    if (isNaN(cantidadPesos) || cantidadPesos <= 0) {
        document.getElementById('resultado').textContent = 'Por favor, ingrese una cantidad válida de pesos chilenos.';
        return;
    }

    try {
        const response = await fetch(`${url}/${monedaDestino}`);
        if (!response.ok) {
            throw new Error('No se pudo obtener el valor de la moneda');
        }
        
        const data = await response.json();
        const valorMoneda = data.serie[0].valor;

        if (isNaN(valorMoneda) || valorMoneda <= 0) {
            throw new Error('Valor de la moneda no válido');
        }

        const resultado = cantidadPesos / valorMoneda;
        document.getElementById('resultado').textContent = `Resultado: ${resultado.toFixed(2)} ${monedaDestino.toUpperCase()}`;
    } catch (error) {
        console.error('Error al convertir moneda:', error.message);
        document.getElementById('resultado').textContent = 'Seleccione Moneda a convenir';
    }
}
async function obtenerDatosDolarUltimos10Dias() {
    const url = 'https://mindicador.cl/api/dolar';
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('No se pudo obtener los datos del dólar');
        }
        
        const data = await response.json();
        const ultimos10Dias = data.serie.slice(-10);  // Obtener los últimos 10 días

        return ultimos10Dias.map(dato => ({
            fecha: dato.fecha.substr(0, 10), // Tomar solo la parte de la fecha (YYYY-MM-DD)
            valor: dato.valor,
        }));
    } catch (error) {
        console.error('Error al obtener datos del dólar:', error.message);
        return null;
    }
}
async function getAndCreateDataToChart() {
    const datosDolar = await obtenerDatosDolarUltimos10Dias();
    if (!datosDolar || datosDolar.length === 0) {
        return { labels: [], datasets: [] };
    }

    const labels = datosDolar.map(dato => dato.fecha);
    const data = datosDolar.map(dato => dato.valor);

    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Dólar últimos 10 días',
                borderColor: 'rgb(75, 192, 192)',
                data: data,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    };

    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, config);
}
async function renderGrafica() {
    await obtenerIndicadores(); // Asegurar que los indicadores se obtengan primero
    await getAndCreateDataToChart(); // Renderizar el gráfico de dólar

    const myChart = document.getElementById('myChart');
    myChart.style.backgroundColor = 'white';
}
document.addEventListener('DOMContentLoaded', () => {
    renderGrafica();
});
document.getElementById('buscar').addEventListener('click', convertirMoneda);
document.getElementById('cantidadPesos').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        convertirMoneda();
    }
});
