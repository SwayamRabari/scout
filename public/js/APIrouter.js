// Selecting DOM elements
const mui = document.querySelector('.mui');
const query = document.querySelector('.query');
const form = document.querySelector('form');
const list = document.querySelector('.list');
const articles = document.querySelector('.articles');
const tlist = document.querySelector('.tlist');
const identifier = document.querySelector('.identifier');

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const params = new URLSearchParams(window.location.search);
const username = params.get('username');
identifier.innerHTML = `Hello, ${capitalizeFirstLetter(username)}!`;
const categoriesstring = params.get('categories');
const categories = categoriesstring.split(',');
console.log(categories); // Getting today's date
const headlinesIndex = categories.indexOf('Headlines');

// If "Headlines" is included, move it to the beginning of the array
if (headlinesIndex !== -1) {
  // Remove "Headlines" from its current position
  categories.splice(headlinesIndex, 1);
}

// Add "Headlines" to the beginning of the array
categories.unshift('Headlines');

// Displaying the list of categories
const displayList = (() => {
  categories.forEach((category) => {
    if (category == categories[0]) {
      list.innerHTML += `
        <div class="option">
          <input type="radio" name="category" id="${category}" hidden checked/>
          <label class="listlabel" for="${category}">${category}</label>
        </div>
      `;
    } else {
      list.innerHTML += `
        <div class="option">
          <input type="radio" name="category" id="${category}" hidden />
          <label class="listlabel" for="${category}">${category}</label>
        </div>
      `;
    }
  });
})();


const today = new Date();

// Calculating yesterday's date
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

// Calculating the date of 2 days before
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(today.getDate() - 2);

// Formatting the dates as strings in 'YYYY-MM-DD' format
const yesterdayString = yesterday.toISOString().split('T')[0];
const twoDaysAgoString = twoDaysAgo.toISOString().split('T')[0];

// Adding event listener for form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  articles.innerHTML = '';
  for (const radioButton of radioButtons) {
    radioButton.checked = false;
  }
  const response = await getData(query.value);
  query.value = '';
  displayArticles(response);
});

// Getting radio buttons for categories
const radioButtons = document.querySelectorAll(
  'input[type="radio"][name="category"]'
);

// Adding event listener for category change
radioButtons.forEach((radioButton) => {
  radioButton.addEventListener('change', async function () {
    const value = this.id;
    articles.innerHTML = '';
    const response = await getData(value);
    displayArticles(response);
  });
});

// Function to fetch news data
async function getData(category) {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?apiKey=3ad13e6fa2c7438d8a1d069a704936e9&from=${
        category == 'Headlines' ? `${yesterdayString}` : `${twoDaysAgoString}`
      }&sortBy=publishedAt&language=en&
      &q=${category == 'Headlines' ? 'Headlines' : category}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const jsonResponse = await response.json();
    const filteredArticles = filterArticles(jsonResponse.articles);
    return filteredArticles;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to fetch trending news
async function displayTrending() {
  const trending = await getTrending();
  displayTrendingList(trending);
}

// Function to fetch trending news data
async function getTrending() {
  try {
    const trending = await fetch(
      `https://newsapi.org/v2/everything?apiKey=3ad13e6fa2c7438d8a1d069a704936e9&language=en&from=${yesterdayString}&q=global`
    );
    if (!trending.ok) {
      throw new Error('Failed to fetch data');
    }
    const jsonResponse = await trending.json();
    const filteredTrendingArticles = filterArticles(jsonResponse.articles);
    return filteredTrendingArticles;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to display trending news list
function displayTrendingList(trending) {
  for (let i = 0; i < 100; i++) {
    const tarticle = document.createElement('div');
    tarticle.classList.add('tarticle');

    const timage = document.createElement('div');
    timage.classList.add('timage');
    const img = document.createElement('img');
    img.src = trending[i].urlToImage || '/public/images/scoutalt.png';
    img.alt = '';
    img.onerror = function () {
      this.onerror = null;
      this.src = 'scoutalt.png';
    };
    timage.appendChild(img);

    const tcontent = document.createElement('div');
    tcontent.classList.add('tcontent');
    const thead = document.createElement('div');
    thead.classList.add('thead');
    thead.textContent = trending[i].title;
    const timeSource = document.createElement('div');
    timeSource.classList.add('time-source-trending');
    const source = document.createElement('div');
    source.classList.add('source');
    source.textContent = trending[i].source.name;
    timeSource.appendChild(source);
    tcontent.appendChild(thead);
    tcontent.appendChild(timeSource);

    tarticle.appendChild(timage);
    tarticle.appendChild(tcontent);

    tarticle.addEventListener('click', function () {
      window.open(trending[i].url, '_blank');
    });

    tlist.appendChild(tarticle);
  }
}

// Function to filter articles
function filterArticles(articles) {
  return articles.filter((article) => {
    return (
      article.source.name !== null &&
      article.title !== null &&
      article.url !== null &&
      article.urlToImage !== null &&
      article.description !== null &&
      article.content !== null &&
      article.publishedAt !== null &&
      article.source.name !== '[Removed]' &&
      article.title !== '[Removed]' &&
      article.url !== '[Removed]' &&
      article.urlToImage !== '[Removed]' &&
      article.description !== '[Removed]' &&
      article.content !== '[Removed]' &&
      article.publishedAt !== '[Removed]'
    );
  });
}

// Function to display articles
function displayArticles(response) {
  articles.innerHTML = '';
  response.slice(0, 100).forEach((article) => {
    const articleElement = document.createElement('div');
    articleElement.classList.add('article');

    const articleLink = document.createElement('a');
    articleLink.href = article.url;
    articleLink.target = '_blank';
    articleLink.innerHTML = `
      <div class="image">
        <img src="${
          article.urlToImage || '/public/images/scoutalt.png'
        }" alt="" class="nimage" onerror="this.onerror=null; this.src='/public/images/scoutalt.png';">
      </div>
      <div class="heading">${article.title}</div>
      <div class="description">${article.description}</div>
      <div class="time-source">
        <div class="time">${transform_date(
          article.publishedAt.slice(0, 10)
        )}</div>
        <div class="source">${article.source.name}</div>
      </div>
    `;
    articleElement.appendChild(articleLink);
    articles.appendChild(articleElement);
  });
}

// Function to transform date format
function transform_date(date_str) {
  const date_obj = new Date(date_str);
  if (isNaN(date_obj.getTime())) {
    return 'Invalid Date';
  }
  const year = date_obj.getFullYear();
  const month = date_obj.getMonth();
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date_obj);
}

// Displaying trending news
displayTrending();

// Fetching and displaying headlines
async function displayHeadlines() {
  const response = await getData('Headlines');
  displayArticles(response);
}
displayHeadlines();
