const screen = document.getElementById('screen');
const history = document.getElementById('history');
const keypad = document.querySelector('.keypad');

let current = '0';
let previous = null;
let operator = null;
let shouldResetScreen = false;
let justCalculated = false;

const operatorSymbols = { '+': '+', '−': '−', '×': '×', '÷': '÷' };

function formatNumber(value) {
  if (!Number.isFinite(value)) return 'Error';
  if (Object.is(value, -0)) value = 0;
  const rounded = Number.parseFloat(value.toPrecision(12));
  return String(rounded);
}

function updateDisplay() {
  screen.textContent = current;
  document.querySelectorAll('[data-operator]').forEach(button => {
    button.classList.toggle('selected', button.dataset.operator === operator && !shouldResetScreen);
  });
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  shouldResetScreen = false;
  justCalculated = false;
  history.textContent = '';
  updateDisplay();
}

function inputNumber(number) {
  if (current === 'Error' || shouldResetScreen || justCalculated) {
    current = number;
    shouldResetScreen = false;
    justCalculated = false;
  } else {
    current = current === '0' ? number : current + number;
  }
  updateDisplay();
}

function inputDecimal() {
  if (current === 'Error' || shouldResetScreen || justCalculated) {
    current = '0.';
    shouldResetScreen = false;
    justCalculated = false;
  } else if (!current.includes('.')) {
    current += '.';
  }
  updateDisplay();
}

function chooseOperator(nextOperator) {
  if (current === 'Error') return;
  const inputValue = Number(current);
  if (operator && !shouldResetScreen) {
    const result = calculate(previous, inputValue, operator);
    if (result === null) return showError();
    current = formatNumber(result);
    screen.textContent = current;
  } else {
    previous = inputValue;
  }
  operator = nextOperator;
  previous = Number(current);
  shouldResetScreen = true;
  justCalculated = false;
  history.textContent = `${current} ${operatorSymbols[operator]}`;
  updateDisplay();
}

function calculate(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? null : a / b;
    default: return b;
  }
}

function showError() {
  current = 'Error';
  previous = null;
  operator = null;
  shouldResetScreen = true;
  justCalculated = true;
  history.textContent = 'Cannot divide by zero';
  updateDisplay();
}

function equals() {
  if (!operator || previous === null || current === 'Error') return;
  const a = previous;
  const b = Number(current);
  const op = operator;
  const result = calculate(a, b, op);
  history.textContent = `${formatNumber(a)} ${operatorSymbols[op]} ${formatNumber(b)} =`;
  if (result === null) return showError();
  current = formatNumber(result);
  previous = null;
  operator = null;
  shouldResetScreen = true;
  justCalculated = true;
  updateDisplay();
}

function deleteLast() {
  if (current === 'Error' || shouldResetScreen || justCalculated) {
    current = '0';
    shouldResetScreen = false;
    justCalculated = false;
  } else {
    current = current.length > 1 ? current.slice(0, -1) : '0';
    if (current === '-') current = '0';
  }
  updateDisplay();
}

function changeSign() {
  if (current === 'Error') return;
  current = formatNumber(Number(current) * -1);
  updateDisplay();
}

function percent() {
  if (current === 'Error') return;
  current = formatNumber(Number(current) / 100);
  updateDisplay();
}

keypad.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.dataset.number !== undefined) inputNumber(button.dataset.number);
  else if (button.dataset.operator) chooseOperator(button.dataset.operator);
  else {
    switch (button.dataset.action) {
      case 'clear': clearAll(); break;
      case 'delete': deleteLast(); break;
      case 'decimal': inputDecimal(); break;
      case 'sign': changeSign(); break;
      case 'percent': percent(); break;
      case 'equals': equals(); break;
    }
  }
});

document.addEventListener('keydown', event => {
  if (/^[0-9]$/.test(event.key)) inputNumber(event.key);
  else if (event.key === '.') inputDecimal();
  else if (event.key === '+') chooseOperator('+');
  else if (event.key === '-') chooseOperator('−');
  else if (event.key === '*') chooseOperator('×');
  else if (event.key === '/') { event.preventDefault(); chooseOperator('÷'); }
  else if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); equals(); }
  else if (event.key === 'Backspace') deleteLast();
  else if (event.key === 'Escape' || event.key.toLowerCase() === 'c') clearAll();
  else if (event.key === '%') percent();
});

updateDisplay();
