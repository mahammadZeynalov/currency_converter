const topCurrenciesFrom = document.querySelectorAll('.top-currencies-from .top-cur');
const topCurrenciesTo = document.querySelectorAll('.top-currencies-to .top-cur');

const selectFrom = document.querySelector('.select-currencies-from');
const selectTo = document.querySelector('.select-currencies-to');

const inputFrom = document.querySelector('.input-from');
const inputTo = document.querySelector('.input-to');

let data = loadAvailableCurrencies();
fillDropDownLists(data);

inputFrom.addEventListener('input', convertMoney);
inputTo.addEventListener('input', convertMoney);
addEventListenersToCurrenciesFrom();
addEventListenersToCurrenciesTo();

selectFrom.addEventListener('change', (e)=> {
    resetColorsFrom();
    // e.target.style.backgroundColor = 'red';
    convertMoney(e);
    loadCurrenciesRate();
});
selectTo.addEventListener('change', (e)=> {
    resetColorsTo();
    convertMoney(e);
    loadCurrenciesRate();
});

function addEventListenersToCurrenciesFrom() {
    topCurrenciesFrom.forEach((cur) => {
        cur.addEventListener('click', (e) => {
            resetColorsFrom();
            cur.classList.add('selected-from-cur');
            convertMoney(e);
            loadCurrenciesRate();
        });
    });
}

function addEventListenersToCurrenciesTo() {
    topCurrenciesTo.forEach((cur) => {
        cur.addEventListener('click', (e) => {
            resetColorsTo();
            cur.classList.add('selected-to-cur');
            convertMoney(e);
            loadCurrenciesRate();
        });
    });
}

async function convertMoney(e) {
    formatInput();
    let info = await sendRequest();
    console.log(info);

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
    console.log(e.target);
    const topCurFrom = document.querySelector('.top-currencies-from');

    if(topCurFrom.contains(e.target) || e.target == inputFrom || selectFrom.contains(e.target)) {
        inputTo.value = inputFrom.value * info[0].rates[currencyTo];
    } else {
        inputFrom.value = inputTo.value * info[1].rates[currencyFrom];
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

    let dataFromResponse = await fetch(`https://api.ratesapi.io/api/latest?base=${currencyFrom}&symbols=${currencyTo}`)
    let dataFrom = await dataFromResponse.json();
    let dataToResponse = await fetch(`https://api.ratesapi.io/api/latest?base=${currencyTo}&symbols=${currencyFrom}`)
    let dataTo = await dataToResponse.json();

    let responses = [];
    responses.push(dataFrom);
    responses.push(dataTo);
    return responses;
}

function formatInput() {
    inputFrom.value = inputFrom.value.replace(',', '.');
}

async function loadCurrenciesRate() {

}

async function displayCurrentRate() {

}

function changeCurrencyPositions() {

}

function loadDelay() {

}

function isCurrenciesAreSame() {

}



