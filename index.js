/// App Container
const myContainer = document.querySelector('.container')
const searchInput = document.querySelector('.search-input');

const autoCompleteMenu = document.querySelector('.menu');

/// GLOBAL USE
const repositoryList = new Map();
let clickedRepository;

/// Input Even listener
let requestTimeArr = [];
let myRequsetSetTimeOut;
let debounceTime = 200;

searchInput.addEventListener('input', githubRequest)

function githubRequest (event) {
  if (clickedRepository) {
    clickedRepository.classList.remove('menu-item--active');
  }
  if (searchInput.value == 0 || searchInput.value == '') {
    autoCompleteMenu.classList.remove('menu--active');
    autoCompleteMenu.removeEventListener('click', menuAoutoComplete);
    clearTimeout(myRequsetSetTimeOut);
    return;
  }else {
    requestTimeArr.push(Date.now());
    if (requestTimeArr.length > 1 && (requestTimeArr[requestTimeArr.length - 1] - requestTimeArr[requestTimeArr.length -2] < debounceTime)) {
      clearTimeout(myRequsetSetTimeOut);
      myRequsetSetTimeOut = setTimeout(() => {
        let requestResult = getGithubReposity(searchInput.value);
        requestResult.then(results => {
          autoCompleteMenu.addEventListener('click', menuAoutoComplete);
          setMenuItems(results.items);
        });
      }, debounceTime)
      return;
    }
    myRequsetSetTimeOut = setTimeout(() => {
      let requestResult = getGithubReposity(searchInput.value);
      requestResult.then(results => {
        autoCompleteMenu.addEventListener('click', menuAoutoComplete);
        setMenuItems(results.items);
      })
    }, debounceTime)
  }
}

// append( nodes or string )
const repositoryInfoLists = document.querySelector('.repository-lists');

function menuAoutoComplete (event) {
  repositoryListContainer.addEventListener('click', deleteRepository);
  if (clickedRepository) {
    clickedRepository.classList.remove('menu-item--active');
  }
  clickedRepository = event.target;
  clickedRepository.classList.add('menu-item--active');
  repositoryInfoLists.classList.add('menu--active');
  if (repositoryList.get(clickedRepository)) {
    repositoryInfoLists.insertAdjacentHTML("afterbegin", repositoryList.get(clickedRepository));
    repositoryList.delete(clickedRepository);
  }
}

// MAP rep

function mapFunction (arg, argObj) {
  let repositoryInfoCard = `
  <li class="repository-list">
    <ul class="list-reset">
      <li>Name: ${argObj.name}</li>
      <li>Owner: ${argObj.owner.login}</li>
      <li>Stars: ${argObj.stargazers_count}</li>
    </ul>
    <button class="delete"></button>
  </li>
`
  repositoryList.set(arg, repositoryInfoCard);
}


// set Item to page
// OK

let repositoryMenuItems = document.querySelectorAll('.menu-item');
function setMenuItems (argArr) {
  try {
    if (argArr.length == 0) {
      autoCompleteMenu.classList.add('menu--active');
      repositoryMenuItems.forEach((el, i) => {
        el.innerHTML = `REPOSITORY NOT FOUND...`;
      })

      return;
    }
    let myRepositoriesArr = [...argArr];
    if (myRepositoriesArr[0]) {
      autoCompleteMenu.classList.add('menu--active');
      repositoryMenuItems.forEach((el, i) => {
      el.innerHTML = `${myRepositoriesArr[i].name}`;
      mapFunction (el, myRepositoriesArr[i]);
    })
    } 
  } catch (err) {
    return;
  }
}


// delete repository list
// OK

const repositoryListContainer = document.querySelector('.repository-lists');

function deleteRepository (event) {
  if (event.target.className != 'delete') {
    return;
  };

  let repositoryDelete = event.target.closest('.repository-list');
  repositoryDelete.remove();

  if (document.querySelector('.repository-list') == null) {
    repositoryListContainer.removeEventListener('click', deleteRepository);
  }
}

// getGithubReposity() 
// OK

async function getGithubReposity (arg) {
  let repositoryListPromise;
  repositoryListPromise = await fetch(`https://api.github.com/search/repositories?q=${arg}+in:name&sort=stars&order=desc&per_page=5&page=1`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`${response.status}`);
      } 
      return response.json();
    })
    .catch(err =>  {
      return 0;
    })

  return repositoryListPromise;
}