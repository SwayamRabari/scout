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

const today = new Date();

// Calculate yesterday's date
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

// Calculate the date of 2 days before
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(today.getDate() - 2);

// Format the dates as strings in 'YYYY-MM-DD' format
const yesterdayString = yesterday.toISOString().split('T')[0];
const twoDaysAgoString = twoDaysAgo.toISOString().split('T')[0];

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

async function displayTrending() {
  const trending = await getTrending();
  displayTrendingList(trending);
}

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

function displayTrendingList(trending) {
  for (let i = 0; i < 100; i++) {
    // Create tarticle element
    const tarticleHTML = `
      <div class="tarticle">
        <div class="timage">
          <img src="${
            trending[i].urlToImage || 'scoutalt.png'
          }" alt="" onerror="this.onerror=null; this.src='scoutalt.png';">
        </div>
        <div class="tcontent">
          <div class="thead">${trending[i].title}</div>
          <div class="time-source-trending">
            <div class="source">${trending[i].source.name}</div>
          </div>
        </div>
      </div>
    `;

    // Create a temporary div to hold the tarticle HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = tarticleHTML;

    // Get the tarticle element from the temporary div
    const tarticle = tempDiv.firstChild;

    // Add click event listener to tarticle for redirection
    tarticle.addEventListener('click', function () {
      window.open(trending[i].url, '_blank'); // Open in a new tab
    });

    // Append tarticle to tlist
    tlist.appendChild(tarticle);
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
  articles.innerHTML = ''; // Clear previous articles
  response.slice(0, 100).forEach((article) => {
    const articleElement = document.createElement('div');
    articleElement.classList.add('article');

    // Wrap the article content in an anchor tag linking to the new page
    const articleLink = document.createElement('a');
    articleLink.href = article.url;
    articleLink.target = '_blank'; // Open in a new tab
    articleLink.innerHTML = `
      <div class="image">
        <img src="${
          article.urlToImage || 'scoutalt.png'
        }" alt="" class="nimage" onerror="this.onerror=null; this.src='scoutalt.png';">
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
