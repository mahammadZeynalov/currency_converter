// Declaring global variables.
const Chart = require('chart.js');
// const apiKey = `35e64c0d61fe18f5a400a522c1ea7cdb`;

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

let globalFromCurrency = 'RUB';
let globalToCurrency = 'USD';
let globalRate = 0;


// Convert the default input values (RUB/USD)
window.addEventListener('load', (e) => {
    // convertMoney(e);
    firstRequest();
    drawTable(yearRequest);
});

// User can interact with app by 3 ways: 
// 1. clicking on the TOP currencies.
// 2. clicking the currency from drop-down list.
// 3. during changing the value of input fields.
// 4. Switching the currencies and input values by clicking on the arrow

inputFrom.addEventListener('input', generalEventHandler);

inputTo.addEventListener('input', generalEventHandler);

selectFrom.addEventListener('change', generalEventHandler);

selectTo.addEventListener('change', generalEventHandler);

switcher.addEventListener('click', switcherDivHandler);

addEventListenersToCurrenciesFrom();
addEventListenersToCurrenciesTo();

function generalEventHandler(e) {
    if (e.target == selectFrom) {
        resetColorsFrom();
        coloringSelectFrom();
    } else if (e.target == selectTo) {
        resetColorsTo();
        coloringSelectTo();
    }

    if (e.target == inputFrom || e.target == inputTo) {
        formatInput(e);
        convertMoney(e);
    } else {
        if(isSameCurrencies() == true) {
            clearTimeout(convertTimer);
            clearTimeout(loadingTimer);
            return;
        }
        clearTimeout(convertTimer);
        clearTimeout(loadingTimer);
        loadingHandler();
        convertHandler(e);
    }
}

function coloringSelectFrom() {
    let options = selectFrom.querySelectorAll('option');
    selectFrom.style.backgroundColor = 'rgb(131,58,224)';
    options.forEach((option) => {
        option.style.backgroundColor = 'white';
    });
}

function coloringSelectTo() {
    let options = selectTo.querySelectorAll('option');
    selectTo.style.backgroundColor = 'rgb(131,58,224)';
    options.forEach((option) => {
        option.style.backgroundColor = 'white';
    });
}

function resetColorSelectFrom() {
    selectFrom.style.backgroundColor = 'white';
}

function resetColorSelectTo() {
    selectTo.style.backgroundColor = 'white';
}

function loadingHandler() {
    loadingTimer = setTimeout(() => {
        loading.style.display = 'block';
        disableInputs();
    }, 1500)
}

function convertHandler(e) {
    convertTimer = setTimeout(() => {
        drawTable(yearRequest);
        convertMoney(e);
        loading.style.display = 'none';
        enableInputs();
    }, 2000)
}

function addEventListenersToCurrenciesFrom() {
    topCurrenciesFrom.forEach((cur) => {
        cur.addEventListener('click', (e) => {
            resetColorSelectFrom();
            resetColorsFrom();
            cur.classList.add('selected-from-cur');
            generalEventHandler(e);

        });
    });
}

function addEventListenersToCurrenciesTo() {
    topCurrenciesTo.forEach((cur) => {
        cur.addEventListener('click', (e) => {
            resetColorSelectTo();
            resetColorsTo();
            cur.classList.add('selected-to-cur');
            generalEventHandler(e);
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
    let currencyFrom = detectSelectedCurrencies()[0];
    let currencyTo = detectSelectedCurrencies()[1];
    let selectedFrom = document.querySelector('.selected-from-cur');
    let fromCurElement = document.querySelector('.current-rate-from');
    let ToCurElement = document.querySelector('.current-rate-to');

    if (isSameCurrencies() == true) {
        return;
    }

    if (isNeedForRequest(e) == false) {
        return;
    }

    let data = await sendRequest();
    globalRate = data.rates[currencyTo];
    globalFromCurrency = currencyFrom;
    globalToCurrency = currencyTo;

    //calculation
    if (e.target == inputFrom || e.target == selectFrom || e.target == selectedFrom) {
        inputTo.value = (inputFrom.value * globalRate).toFixed(2);
    } else {
        inputFrom.value = (inputTo.value * (1 / globalRate)).toFixed(2);
    }

    //rate labels for both sides
    fromCurElement.innerText = `1 ${currencyFrom} = ${globalRate.toFixed(2)} ${currencyTo}`;
    ToCurElement.innerText = `1 ${currencyTo} = ${(1 / globalRate).toFixed(2)} ${currencyFrom}`;

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

function isSameCurrencies() {
    let currencyFrom = detectSelectedCurrencies()[0];
    let currencyTo = detectSelectedCurrencies()[1];
    let fromCurElement = document.querySelector('.current-rate-from');
    let ToCurElement = document.querySelector('.current-rate-to');

    if (currencyFrom == currencyTo) {
        fromCurElement.innerText = `1 ${currencyFrom} = ${1} ${currencyFrom}`;
        ToCurElement.innerText = `1 ${currencyFrom} = ${1} ${currencyFrom}`;
        inputTo.value = inputFrom.value;
        return true;
    }
    return false;
}

async function firstRequest() {
    let fromCurElement = document.querySelector('.current-rate-from');
    let ToCurElement = document.querySelector('.current-rate-to');

    let request = await fetch(`https://api.ratesapi.io/api/latest?base=USD&symbols=RUB`);
    if(request.status != 200) {
        alert('Не удалось запросить данные о валюте. Попробуйте заново.');
        return
    }
    let data = await request.json();
    globalRate = data.rates['RUB'];

    fromCurElement.innerText = `1 RUB = ${(1 / data.rates['RUB']).toFixed(2)} USD`;
    ToCurElement.innerText = `1 USD = ${data.rates['RUB'].toFixed(2)} RUB`;
    inputFrom.value = (inputTo.value * data.rates['RUB']).toFixed(2);
}

function isNeedForRequest(e) {
    let currencyFrom = detectSelectedCurrencies()[0];
    let currencyTo = detectSelectedCurrencies()[1];
    let selectedFrom = document.querySelector('.selected-from-cur');

    if (currencyFrom === globalFromCurrency && currencyTo === globalToCurrency) {
        if (e.target == inputFrom || e.target == selectFrom || e.target == selectedFrom) {
            inputTo.value = (inputFrom.value * globalRate).toFixed(2);
        } else {
            inputFrom.value = (inputTo.value * globalRate).toFixed(2);
        }
        return false;
    }
    return true;
}

async function sendRequest() {
    let currencyFrom = detectSelectedCurrencies()[0];
    let currencyTo = detectSelectedCurrencies()[1];

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
    let left = document.querySelector('.app-parent > section:first-child');
    let center = document.querySelector('.central-block');
    let right = document.querySelector('.app-parent > section:last-child');
    let save = left.querySelector('div:first-child').innerText;
    left.querySelector('div:first-child').innerText = right.querySelector('div:first-child').innerText;
    right.querySelector('div:first-child').innerText = save;
    parent.innerHTML = '';
    parent.append(right, center, left);
}

// https://fixer.io/documentation flactuation

// Preparing array of dates for 3 monthes. 
function prepareDates() {
    let arr = [];
    const time = new Date();
    const monthes = 2;
    let dateInString = '';
    for (let i = 0; i < monthes; i++) {
        dateInString = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
        arr.push(dateInString);
        time.setMonth(time.getMonth() - 1);
    }
    return arr;
}

// prepareDates();

// Make request for each day of the 3 monthes and get rates from them. The api is not working correctly, so sometimes you can see the same dates or some dates are totally missed.
// I also calculating the min and max rates during the period in this function. Sorry for that.
async function yearRequest(prepareDates) {
    let arr = prepareDates();
    let currencyFrom = detectSelectedCurrencies()[0];
    let currencyTo = detectSelectedCurrencies()[1];

    let data = await (await fetch(`https://api.exchangeratesapi.io/history?start_at=${arr[arr.length - 1]}&end_at=${arr[0]}&base=${currencyFrom}&symbols=${currencyTo}`)).json();
    let rates = data.rates;
    let values = [];

    for (let key in rates) {
        values.push(rates[key][currencyTo]);
    }

    const min = Math.min.apply(null, values);
    const max = Math.max.apply(null, values);
    return [min, max, data];
}

// Displaying the graph to the user.
async function drawTable(yearRequest) {
    let currencyTo = detectSelectedCurrencies()[1];

    let data = await yearRequest(prepareDates);
    var ctx = document.getElementById('myChart').getContext('2d');

    let parametrs = {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: [], // filled below
            datasets: [{
                label: 'Currency rate',
                backgroundColor: 'rgb(208,236,222)',
                borderColor: 'green',
                data: [] // filled below
            }]
        },

        // Configuration options go here
        options: {
            events: [],
            scales: {
                yAxes: [{
                    ticks: {
                        max: data[1],
                        min: data[0]
                    }
                }]
            }
        }
    }

    let rates = data[2].rates;

    // get array of date string 
    let dateStrings = Object.keys(data[2].rates);
    // convert them to Date object
    let arrDateObj = [];
    for (let i = 0; i < dateStrings.length; i++) {
        arrDateObj.push(new Date(dateStrings[i]));
    }
    // sort dates in ascending order
    arrDateObj.sort(function (a, b) {
        return a - b;
    });

    let test = [];
    for (let i = 0; i < arrDateObj.length; i++) {
        test.push(arrDateObj[i].toISOString().slice(0, 10));
    }
    // parsing to month-day
    let parsedDates = [];

    for (let i = 0; i < arrDateObj.length; i++) {
        parsedDates.push(arrDateObj[i].toISOString().slice(0, 10).substring(5));
    }

    //filling the labels
    for (let i = 0; i < parsedDates.length; i++) {
        parametrs.data.labels.push(parsedDates[i]);
    }

    // filling data
    for (let i = 0; i < dateStrings.length; i++) {
        parametrs.data.datasets[0].data.push(rates[test[i]][currencyTo]);
    }
    var chart = new Chart(ctx, parametrs);
}