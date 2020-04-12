// Declaring global variables.

// RUB, USD, EUR, GBP
const topCurrenciesFrom = document.querySelectorAll('.top-currencies-from .top-cur');
const topCurrenciesTo = document.querySelectorAll('.top-currencies-to .top-cur');

// Drop-Down list of currencies
const selectFrom = document.querySelector('.select-currencies-from');
const selectTo = document.querySelector('.select-currencies-to');

// Input fields
const inputFrom = document.querySelector('.input-from');
const inputTo = document.querySelector('.input-to');

// Switcher of blocks
const switcher = document.querySelector('.change-arrows');

// Loading screen to be show during request
const loading = document.querySelector('.loading-parent');

// Load aviliable currencies from the server and fill drop-down lists
let data = loadAvailableCurrencies();
fillDropDownLists(data);

// This variables are declared to control the timer. The main purpose of them to stop the previous event.
let convertTimer;
let loadingTimer;

// Convert the default input values (RUB/USD)
window.addEventListener('load', (e) => {
    convertMoney(e);
});

// User can interact with app by 3 ways: 
// 1. clicking on the TOP currencies.
// 2. clicking the currency from drop-down list.
// 3. during changing the value of input fields.
// 4. Switching the currencies and input values by clicking on the arrow

inputFrom.addEventListener('input', (e) => {
    formatInput(e);
    clearTimeout(convertTimer);
    clearTimeout(loadingTimer);
    loadingHandler();
    convertHandler(e);
});

inputTo.addEventListener('input', (e) => {
    formatInput(e);
    clearTimeout(convertTimer);
    clearTimeout(loadingTimer);
    loadingHandler();
    convertHandler(e);
});

selectFrom.addEventListener('change', (e) => {
    clearTimeout(convertTimer);
    clearTimeout(loadingTimer);
    resetColorsFrom();
    loadingHandler();
    convertHandler(e);
});

selectTo.addEventListener('change', (e) => {
    clearTimeout(convertTimer);
    clearTimeout(loadingTimer);
    resetColorsTo();
    loadingHandler();
    convertHandler(e);
});

addEventListenersToCurrenciesFrom();
addEventListenersToCurrenciesTo();

switcher.addEventListener('click', switcherDivHandler);

function loadingHandler() {
    loadingTimer = setTimeout(() => {
        loading.style.display = 'block';
        disableInputs();
    }, 1000)
}

function convertHandler(e) {
    convertTimer = setTimeout(() => {
        convertMoney(e);
        loading.style.display = 'none';
        enableInputs();
    }, 2000)
}

function addEventListenersToCurrenciesFrom() {
    topCurrenciesFrom.forEach((cur) => {
        cur.addEventListener('click', (e) => {
            clearTimeout(convertTimer);
            clearTimeout(loadingTimer);
            resetColorsFrom();
            cur.classList.add('selected-from-cur');
            loadingHandler();
            convertHandler(e);

        });
    });
}

function addEventListenersToCurrenciesTo() {
    topCurrenciesTo.forEach((cur) => {
        cur.addEventListener('click', (e) => {
            clearTimeout(convertTimer);
            clearTimeout(loadingTimer);
            resetColorsTo();
            cur.classList.add('selected-to-cur');
            loadingHandler();
            convertHandler(e);
        });
    });
}

function detectSelectedCurrencies() {
    let currencyFrom;
    let currencyTo;

    if (document.querySelector('.selected-from-cur') == null) {
        currencyFrom = selectFrom.value;
    } else {
        currencyFrom = document.querySelector('.selected-from-cur').innerText;
    }
    if (document.querySelector('.selected-to-cur') == null) {
        currencyTo = selectTo.value;
    } else {
        currencyTo = document.querySelector('.selected-to-cur').innerText;
    }

    return [currencyFrom, currencyTo];
}

function disableInputs() {
    inputFrom.disabled = true;
    inputTo.disabled = true;
}

function enableInputs() {
    inputFrom.disabled = false;
    inputTo.disabled = false;
}

// convertMoney waits for request, calculates the result and shows it to user. Too much for one function - refactoring needed.
async function convertMoney(e) {
    let info = await sendRequest();

    let currencyFrom = detectSelectedCurrencies()[0];
    let currencyTo = detectSelectedCurrencies()[1];

    if (info == false) {
        let fromCurElement = document.querySelector('.current-rate-from');
        fromCurElement.innerText = `1 ${currencyFrom} = ${1} ${currencyFrom}`;
        let ToCurElement = document.querySelector('.current-rate-to');
        ToCurElement.innerText = `1 ${currencyFrom} = ${1} ${currencyFrom}`;
        inputFrom.value = 1;
        inputTo.value = 1;
        return;
    }

    let selectedFrom = document.querySelector('.selected-from-cur');

    if (e.target == inputFrom || e.target == selectFrom || e.target == selectedFrom) {
        inputTo.value = (inputFrom.value * info.rates[currencyTo]).toFixed(2);
    } else {
        inputFrom.value = (inputTo.value * (1 / info.rates[currencyTo])).toFixed(2);
    }

    let fromCurElement = document.querySelector('.current-rate-from');
    fromCurElement.innerText = `1 ${currencyFrom} = ${info.rates[currencyTo].toFixed(2)} ${currencyTo}`;
    let ToCurElement = document.querySelector('.current-rate-to');
    ToCurElement.innerText = `1 ${currencyTo} = ${(1 / info.rates[currencyTo]).toFixed(2)} ${currencyFrom}`;

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
    if (response.status != 200) {
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
        let country = '';
        for (let i = 0; i < Object.keys(info.rates).length; i++) {
            country = Object.keys(info.rates)[i];
            if (country != 'RUB' && country != 'USD' && country != 'EUR' && country != 'GBP') {
                let curOption = document.createElement('option');
                curOption.value = Object.keys(info.rates)[i];
                curOption.innerText = curOption.value;
                list.append(curOption);
            }
        }
    });
}

async function sendRequest() {
    let currencyFrom = detectSelectedCurrencies()[0];
    let currencyTo = detectSelectedCurrencies()[1];

    if (currencyFrom == currencyTo) {
        return false;
    }

    let dataFromResponse = await fetch(`https://api.ratesapi.io/api/latest?base=${currencyFrom}&symbols=${currencyTo}`);
    if (dataFromResponse.status != 200) {
        alert('Не удалось запросить данные об исходной валюте. Пожалуйсто, попробуйте еще раз.');
        return;
    }
    let dataFrom = await dataFromResponse.json();
    return dataFrom;
}

function formatInput(e) {
    e.target.value = e.target.value.replace(',', '.');
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

const time = new Date();
// function prepareDates() {
//     const time = new Date();
//     let str1 = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
//     time.setDate(time.getDate() - 1);
//     let str2 = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
//     time.setDate(time.getDate() - 1);
//     let str3 = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
//     time.setDate(time.getDate() - 1);
//     let str4 = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
//     time.setDate(time.getDate() - 1);
//     let str5 = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
//     time.setDate(time.getDate() - 1);
//     let str6 = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
//     time.setDate(time.getDate() - 1);
//     let str7 = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;

//     let currencyFrom = detectSelectedCurrencies()[0];
//     let currencyTo = detectSelectedCurrencies()[1];
// }

const Chart = require('chart.js');

var ctx = document.getElementById('myChart').getContext('2d');
var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: ['hello', 'Fy', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
            label: 'Rate',
            backgroundColor: 'rgb(208,236,222)',
            borderColor: 'green',
            data: [0, 10, 5, 2, 20, 30, 45]
        }]
    },

    // Configuration options go here
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    suggestedMin: 10,
                    suggestedMax: 100
                }
            }]
        }
    }
});

