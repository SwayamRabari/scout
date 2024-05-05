const mui = document.querySelector('.mui');
const query = document.querySelector('.query');
const form = document.querySelector('form');
const list = document.querySelector('.list');
const articles = document.querySelector('.articles');
const tlist = document.querySelector('.tlist');
const categories = [
  'Headlines',
  'Technology',
  'Business',
  'Politics',
  'World',
  'Science',
  'Health',
  'Education',
  'Entertainment',
  'Sports',
  'Opinion',
  'Crime',
  'Investigations',
];

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

const radioButtons = document.querySelectorAll(
  'input[type="radio"][name="category"]'
);

radioButtons.forEach((radioButton) => {
  radioButton.addEventListener('change', async function () {
    const value = this.id;
    articles.innerHTML = '';
    const response = await getData(value);
    displayArticles(response);
  });
});

async function getData(category) {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?apiKey=6f1601fe13304a53a05de8583b344220&from=${
        category == 'Headlines' ? '2024-04-10' : '2024-04-8'
      }&q=${category == 'Headlines' ? 'Headlines' : category}`
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

async function displayTrending() {
  const trending = await getTrending();
  displayTrendingList(trending);
}

async function getTrending() {
  try {
    const trending = await fetch(
      `https://newsapi.org/v2/everything?apiKey=6f1601fe13304a53a05de8583b344220&language=en&from=2024-04-10&q=global`
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

function displayTrendingList(trending) {
  for (let i = 0; i < 100; i++) {
    tlist.innerHTML += `
    <div class="tarticle">
      <div class="timage">
        <img
          src="${trending[i].urlToImage}"
          alt=""
          srcset=""
        />
      </div>
      <div class="tcontent">
        <div class="thead">
          ${trending[i].title}
        </div>
        <div class="time-source-trending">
          <div class="source">${trending[i].source.name}</div>
        </div>
      </div>
    </div>
    `;
  }
}

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

function displayArticles(response) {
  for (let i = 0; i < 100; i++) {
    articles.innerHTML += `
    <div class="article">
      <div class="image">
        <img
          src="${response[i].urlToImage}"
          alt=""
          srcset=""
          class="nimage"
          onerror="this.onerror=null; this.src='scoutalt.png';"
        />
      </div>
      <div class="heading">
        ${response[i].title}
      </div>
      <div class="description">
        ${response[i].description}
      </div>
      <div class="time-source">
        <div class="time">${transform_date(
          response[i].publishedAt.slice(0, 10)
        )}</div>
        <div class="source">${response[i].source.name}</div>
      </div>
    </div>`;
  }
}

function transform_date(date_str) {
  // Parse the date string

  const date_obj = new Date(date_str);

  // Check for valid date object (avoid errors for invalid formats)
  if (isNaN(date_obj.getTime())) {
    return 'Invalid Date';
  }

  // Extract year, month, and day components
  const year = date_obj.getFullYear();
  const month = date_obj.getMonth(); // Months are zero-indexed

  // Format the date string as "Month Day, YYYY"
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date_obj);
}
displayTrending();

const response = await getData('Headlines');
displayArticles(response);
