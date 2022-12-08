/// App Container
const myContainer = document.querySelector('.container')
const searchInput = document.querySelector('.search-input');

const autoCompleteMenu = document.querySelector('.menu');

/// GLOBAL USE
const someMap = new Map();

let clickedRepository;

/// Input Even listener
let timeArr = [];
let myTimeOut;
let debounceTime = 200;

searchInput.addEventListener('keyup', (event) => {
  if (clickedRepository) {
    clickedRepository.classList.remove('menu-item--active');
  }
  if (searchInput.value == 0) {
    autoCompleteMenu.classList.remove('menu--active');
    return
  }else {
    timeArr.push(Date.now());
    if (timeArr.length > 1 && (timeArr[timeArr.length - 1] - timeArr[timeArr.length -2] < debounceTime)) {
      clearTimeout(myTimeOut);
      myTimeOut = setTimeout(() => {
        let requestResult = getGithubReposity(searchInput.value);
        if (requestResult) {
          requestResult.then(results => {
            setMenuItems(results.items);
          });
        }
      }, debounceTime)
      return;
    }
    myTimeOut = setTimeout(() => {
      let requestResult = getGithubReposity(searchInput.value);
      if (requestResult) {
        requestResult.then(results => {
          setMenuItems(results.items);
        })
      }
    }, debounceTime)
  }
})

// append( nodes or string )
const repList = document.querySelector('.repository-lists');

autoCompleteMenu.addEventListener('click', (event) => {
  if (clickedRepository) {
    clickedRepository.classList.remove('menu-item--active');
  }
  clickedRepository = event.target;
  clickedRepository.classList.add('menu-item--active');
  repList.classList.add('menu--active');
  if (someMap.get(clickedRepository))
    repList.insertAdjacentHTML("afterbegin", someMap.get(clickedRepository));
    someMap.delete(clickedRepository);
})

function mapFunction (arg, argObj) {
  let str = `
  <li class="repository-list">
    <ul class="list-reset">
      <li>Name: ${argObj.name}</li>
      <li>Owner: ${argObj.owner.login}</li>
      <li>Stars: ${argObj.stargazers_count}</li>
    </ul>
    <button class="delete"></button>
  </li>
`
  someMap.set(arg, str);
}


// set Item to page
let menuItems = document.querySelectorAll('.menu-item');
function setMenuItems (argArr) {
  try {
    let myArr = [...argArr];
    if (myArr[0]) {
      autoCompleteMenu.classList.add('menu--active');
      menuItems.forEach((el, i) => {
      el.innerHTML = `${myArr[i].name}`;
      mapFunction (el, myArr[i]);
    })
    }
  } catch (err) {
    return;
  }
}


// delete repository list

const repositoryListContainer = document.querySelector('.repository-lists');

repositoryListContainer.addEventListener('click', (event) => {
  if (event.target.className != 'delete') {
    return;
  };

  let repositoryDelete = event.target.closest('.repository-list');
  repositoryDelete.remove();
})

// getGithubReposity()

async function getGithubReposity (arg) {
  let promise;
  try {
    promise = await fetch(`https://api.github.com/search/repositories?q=${arg}+in:name&sort=stars&order=desc&per_page=5&page=1`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`${response.status}`);
        } 
        return response.json();
      })
      .catch(err =>  {
        return 0;
      })
  } catch (err) {
    return 0;
  }

  return promise;
}