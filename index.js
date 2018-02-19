import data from './data';

const tablebody = document.getElementById('tablebody');
const rowsPerPage = 10;
const buttons = document.getElementById('paginator');

//формируем таблицу из файла json
function createTable() {
  tablebody.innerHTML = '';
  data.forEach(person => {
    const row = `<tr>
    <td>${person.name}</td>
    <td>${person.position}</td>
    <td>${person.office}</td>
    <td>${person.age}</td>
    <td>${person.start_date}</td>
    <td>${person.salary}</td>
  </tr>`;
    tablebody.innerHTML += row;
  });
}

createTable();

// инициируем страницу
function createPage() {
  const rows = document.querySelectorAll('tbody > tr');
  //считаем количество отображаемых кнопок
  const countPages = () =>
    Math.ceil(
      [...rows].filter(row => !row.classList.contains('filtered')).length /
        rowsPerPage,
    );
  // добавляем кнопки
  const createButtons = num => {
    buttons.innerHTML = ''; //обновляем кнопки при изменении количества страниц при фильтрации
    for (let i = 1; i <= num; i++) {
      buttons.innerHTML += `<a id="${i}">${i}</a>`;
    }
    buttons.children[0].classList.add('current'); //на первую кнопку ставим класс 'current'
    //добавляем кнопки previous и next (на previous сразу ставим disabled, чтобы он был неактивным при загрузке)
    buttons.innerHTML = `<a id="previousButton" class="disabled">Previous</a>${
      buttons.innerHTML
    }<a id="nextButton">Next</a>`;
  };
  createButtons(countPages()); //создаем кнопки

  //отображаем страницу, с учетом фильтра
  [...rows]
    .filter(row => !row.classList.contains('filtered'))
    .slice(rowsPerPage)
    .forEach(row => row.classList.add('hidden')); // выводим на первой странице 10 элементов, остальные скрываем
}

createPage();

// добавляем события на кнопки
function addButtonEvents() {
  const rows = document.querySelectorAll('tbody > tr');
  let currentPage = 1; //задаем текущую страницу по умолчанию
  //показывает страницу в зависимости от ее номера
  const refreshPage = targetPage => {
    // console.log(currentPage, targetPage);
    currentPage = targetPage;
    const activeRows = [...rows].filter(
      row => !row.classList.contains('filtered'),
    );
    const activeRowsNumber = activeRows.length;
    const nextButton = document.getElementById('nextButton');
    if (currentPage >= activeRowsNumber / rowsPerPage) {
      //если текущая страница === последняя страница - делаем кнопку неактивной
      nextButton.classList.add('disabled');
    } else {
      //иначе делаем активной и устанавливаем событие
      nextButton.classList.remove('disabled');
    }

    const prevButton = document.getElementById('previousButton');
    // console.log('currentPage', currentPage);
    if (currentPage == 1) {
      //если текущая страница === первая страница - делаем кнопку неактивной
      prevButton.classList.add('disabled');
    } else {
      //иначе делаем активной и устанавливаем событие
      prevButton.classList.remove('disabled');
    }

    [...rows].forEach(row => row.classList.add('hidden')); //скрываем все строки
    const maxIndex = // Определяем максимально возможный индекс строки таблицы на отображаемой странице (учитывая случай последней страницы, где записей меньше, чем строк на странице)
      targetPage * rowsPerPage > activeRowsNumber
        ? activeRowsNumber - 1
        : targetPage * rowsPerPage - 1;

    for (
      // отображаем все необходимые строки на странице, снимая класс hidden
      let rowIndex = (targetPage - 1) * rowsPerPage;
      rowIndex <= maxIndex;
      rowIndex++
    ) {
      activeRows[rowIndex].classList.remove('hidden');
    }
    currentPage = targetPage; //меняем номер текущей страницы
    document.querySelector('.current').classList.remove('current'); //снимаем класс 'current'
    document.getElementById(targetPage).classList.add('current'); //добавляем на текущую страницу класс 'current'
  };

  const addNextEvent = () => {
    document
      .getElementById('nextButton')
      .addEventListener('click', () => refreshPage(currentPage + 1));
  };

  addNextEvent();

  //добавляем событие на кпопку Previous
  const addPrevEvent = () => {
    document
      .getElementById('previousButton')
      .addEventListener('click', () => refreshPage(currentPage - 1));
  };

  addPrevEvent();

  const addNumEvents = () => {
    //добавляем события на номерные кнопки
    const buttons = [...document.getElementById('paginator').children];
    const numButtons = buttons.slice(1, -1); //выбираем все номерные кнопки
    numButtons.forEach(numButton =>
      numButton.addEventListener('click', () =>
        refreshPage(Number(numButton.id)),
      ),
    );
  };

  addNumEvents();
}

addButtonEvents();

// поиск по таблице

let querySearch;

document
  .getElementById('search')
  .addEventListener('keyup', e => (querySearch = e.target.value));

document.getElementById('submit').addEventListener('click', filterRows);

function filterRows(e) {
  e.preventDefault();
  const rows = document.querySelectorAll('tbody > tr');
  [...rows].forEach(row => {
    row.classList.remove('filtered');
    row.classList.remove('hidden');
  });
  [...rows].forEach(row => {
    if (
      ![...row.children].some(td =>
        td.textContent.toUpperCase().includes(querySearch.toUpperCase()),
      )
    ) {
      row.classList.add('filtered');
    }
  });
  createPage();
  addButtonEvents();
}

// сортировка

const headers = [...document.getElementsByTagName('th')];
headers.forEach(header => header.addEventListener('click', sortRows));

const compareDates = (a, b) => new Date(a) - new Date(b);
const compareWords = (a, b) => (a.toLowerCase() > b.toLowerCase() ? 1 : -1);
const compareNumbers = (a, b) => Number(a) - Number(b);
const compareSalary = (a, b) =>
  +a
    .split('')
    .filter(n => n !== '$' && n !== ',')
    .join('') -
  +b
    .split('')
    .filter(n => n !== '$' && n !== ',')
    .join('');

const compareByType = {
  name: compareWords,
  position: compareWords,
  office: compareWords,
  age: compareNumbers,
  date: compareDates,
  salary: compareSalary,
};

const findCellIndex = type => headers.findIndex(th => th.dataset.type === type);

function sortRows(e) {
  const cellType = e.target.dataset.type;
  const cellIndex = findCellIndex(cellType);
  const compare = (row1, row2) => {
    return compareByType[cellType](
      row1.cells[cellIndex].innerHTML,
      row2.cells[cellIndex].innerHTML,
    );
  };
  const rows = [...document.querySelectorAll('tbody > tr')];

  let sortedRows;

  const header = headers[cellIndex];
  // убираем все active
  [
    ...[...document.getElementsByClassName('arrow-down')],
    ...[...document.getElementsByClassName('arrow-up')],
  ].forEach(element => element.classList.remove('inactive'));

  // выставляем условия сортировки и отображения стрелок
  if (header.classList.contains('sort-asc')) {
    header.getElementsByClassName('arrow-down')[0].classList.add('inactive');
    header.getElementsByClassName('arrow-up')[0].classList.remove('inactive');
    sortedRows = rows.sort(compare).reverse();
    header.classList.remove('sort-asc');
    header.classList.add('sort-desc');
    header.getElementsByClassName('arrow-up')[0].classList.add('sorted');
  } else if (header.classList.contains('sort-desc')) {
    header.getElementsByClassName('arrow-up')[0].classList.add('inactive');
    header.getElementsByClassName('arrow-down')[0].classList.remove('inactive');
    sortedRows = rows.sort(compare);
    header.classList.remove('sort-desc');
    header.classList.add('sort-asc');
  } else {
    header.getElementsByClassName('arrow-up')[0].classList.add('inactive');
    header.getElementsByClassName('arrow-down')[0].classList.remove('inactive');
    sortedRows = rows.sort(compare);
    header.classList.add('sort-asc');
  }

  const tbody = document.getElementById('tablebody');
  tbody.innerHTML = '';
  sortedRows.forEach(row => {
    row.classList.remove('hidden');
    tbody.appendChild(row);
  });
  createPage();
  addButtonEvents();
}
