// const charts = require('chart.js');

const topCurrenciesFrom = document.querySelectorAll('.top-currencies-from .top-cur');
const topCurrenciesTo = document.querySelectorAll('.top-currencies-to .top-cur');

const selectFrom = document.querySelector('.select-currencies-from');
const selectTo = document.querySelector('.select-currencies-to');

const inputFrom = document.querySelector('.input-from');
const inputTo = document.querySelector('.input-to');

const switcher = document.querySelector('.change-arrows');

let data = loadAvailableCurrencies();
fillDropDownLists(data);

inputFrom.addEventListener('input', convertMoney);
inputTo.addEventListener('input', convertMoney);
addEventListenersToCurrenciesFrom();
addEventListenersToCurrenciesTo();

window.addEventListener('load', (e) => {
    convertMoney(e);
});

selectFrom.addEventListener('change', (e)=> {
    resetColorsFrom();
    convertMoney(e);
});

selectTo.addEventListener('change', (e)=> {
    resetColorsTo();
    convertMoney(e);
});

switcher.addEventListener('click', switcherDivHandler)

function addEventListenersToCurrenciesFrom() {
    topCurrenciesFrom.forEach((cur) => {
        cur.addEventListener('click', (e) => {
            resetColorsFrom();
            cur.classList.add('selected-from-cur');
            convertMoney(e);
        });
    });
}

function addEventListenersToCurrenciesTo() {
    topCurrenciesTo.forEach((cur) => {
        cur.addEventListener('click', (e) => {
            resetColorsTo();
            cur.classList.add('selected-to-cur');
            convertMoney(e);
        });
    });
}

async function convertMoney(e) {
    formatInput();
    let info = await sendRequest();

    let currencyFrom;
    let currencyTo;

    if(document.querySelector('.selected-from-cur') == null) {
        currencyFrom = selectFrom.value;
    } else {
        currencyFrom = document.querySelector('.selected-from-cur').innerText;
    }
    if(document.querySelector('.selected-to-cur') == null) {
        currencyTo = selectTo.value;
    } else {
        currencyTo = document.querySelector('.selected-to-cur').innerText;
    }

    if(info == false) {
        let fromCurElement = document.querySelector('.current-rate-from');
        fromCurElement.innerText = `1 ${currencyFrom} = ${1} ${currencyFrom}`;
        let ToCurElement = document.querySelector('.current-rate-to');
        ToCurElement.innerText = `1 ${currencyFrom} = ${1} ${currencyFrom}`;
        inputFrom.value = 1;
        inputTo.value = 1;
        return;
    }

    let selectedFrom = document.querySelector('.selected-from-cur');
    let selectedTo = document.querySelector('.selected-to-cut');

    if(e.target == inputFrom || e.target == selectFrom || e.target == selectedFrom) {
        inputTo.value = (inputFrom.value * info[0].rates[currencyTo]).toFixed(2);
    } else {
        inputFrom.value = (inputTo.value * info[1].rates[currencyFrom]).toFixed(2);
    }
    
    let fromCurElement = document.querySelector('.current-rate-from');
    fromCurElement.innerText = `1 ${info[0].base} = ${info[0].rates[currencyTo].toFixed(2)} ${info[1].base}`;
    let ToCurElement = document.querySelector('.current-rate-to');
    ToCurElement.innerText = `1 ${info[1].base} = ${info[1].rates[currencyFrom].toFixed(2)} ${info[0].base}`;

}

function resetColorsFrom() {
    topCurrenciesFrom.forEach((cur) => {
        cur.classList.remove('selected-from-cur');
    });
}

function resetColorsTo() {
    topCurrenciesTo.forEach((cur) => {
        cur.classList.remove('selected-to-cur');
    });
}

async function loadAvailableCurrencies() {
    let response = await fetch('https://api.ratesapi.io/api/latest');
    if(response.status != 200) {
        alert('Не удалось загрузить данные о валютах.');
        return;
    }
    let data = await response.json();
    return data;
}

async function fillDropDownLists(data) {
    let info = await data;
    let currenciesDropDown = document.querySelectorAll('.select');
    currenciesDropDown.forEach((list) => {
        let country ='';
        for(let i = 0; i < Object.keys(info.rates).length; i++) {
            country = Object.keys(info.rates)[i];
            if(country != 'RUB' && country != 'USD' && country != 'EUR' && country != 'GBP') {
                let curOption = document.createElement('option');
                curOption.value = Object.keys(info.rates)[i];
                curOption.innerText = curOption.value;
                list.append(curOption);
            }
        }
    });
}

async function sendRequest() {
    let currencyFrom;
    let currencyTo;
    if(document.querySelector('.selected-from-cur') == null) {
        currencyFrom = selectFrom.value;
    } else {
        currencyFrom = document.querySelector('.selected-from-cur').innerText;
    }
    if(document.querySelector('.selected-to-cur') == null) {
        currencyTo = selectTo.value;
    } else {
        currencyTo = document.querySelector('.selected-to-cur').innerText
    }

    if(currencyFrom == currencyTo) {
        return false;
    }

    let dataFromResponse = await fetch(`https://api.ratesapi.io/api/latest?base=${currencyFrom}&symbols=${currencyTo}`);
    if(dataFromResponse.status != 200) {
        alert('Не удалось запросить данные о, исходной валюте. Пожалуйсто, попробуйте еще раз.');
        return;
    }
    console.log(dataFromResponse);
    let dataFrom = await dataFromResponse.json();

    let dataToResponse = await fetch(`https://api.ratesapi.io/api/latest?base=${currencyTo}&symbols=${currencyFrom}`)
    if(dataToResponse.status != 200) {
        alert('Не удалось запросить данные о конечной валюте. Пожалуйсто, попробуйте еще раз.');
        return;
    }
    let dataTo = await dataToResponse.json();
    let responses = [];
    responses.push(dataFrom);
    responses.push(dataTo);
    return responses;
}

function formatInput() {
    inputFrom.value = inputFrom.value.replace(',', '.');
}

function switcherDivHandler() {
    let parent = document.querySelector('.app-parent');
    let left = document.querySelector('.app-parent > div:first-child');
    let center = document.querySelector('.central-block');
    let right = document.querySelector('.app-parent > div:last-child');
    let save = left.querySelector('div:first-child').innerText;
    left.querySelector('div:first-child').innerText = right.querySelector('div:first-child').innerText;
    right.querySelector('div:first-child').innerText = save;
    parent.innerHTML = '';
    parent.append(right, center, left);
}

// const chart = document.querySelector('.my-chart');

// var myChart = new Chart(chart, {
//     type: 'bar',
//     data: {
//         labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
//         datasets: [{
//             label: '# of Votes',
//             data: [12, 19, 3, 5, 2, 3],
//             backgroundColor: [
//                 'rgba(255, 99, 132, 0.2)',
//                 'rgba(54, 162, 235, 0.2)',
//                 'rgba(255, 206, 86, 0.2)',
//                 'rgba(75, 192, 192, 0.2)',
//                 'rgba(153, 102, 255, 0.2)',
//                 'rgba(255, 159, 64, 0.2)'
//             ],
//             borderColor: [
//                 'rgba(255, 99, 132, 1)',
//                 'rgba(54, 162, 235, 1)',
//                 'rgba(255, 206, 86, 1)',
//                 'rgba(75, 192, 192, 1)',
//                 'rgba(153, 102, 255, 1)',
//                 'rgba(255, 159, 64, 1)'
//             ],
//             borderWidth: 1
//         }]
//     },
//     options: {
//         scales: {
//             yAxes: [{
//                 ticks: {
//                     beginAtZero: true
//                 }
//             }]
//         }
//     }
// });



