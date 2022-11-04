import { appConfig } from "./config.js"
import { debouncedTimeout, clearContainer, fetcher } from "./utils.js"

const searchResultsListUl = document.querySelector(".search_results_list")
const searchInput = document.querySelector(".search_input")
const resultsCountH4 = document.querySelector(".results_count")
const loaderDiv = document.querySelector(".loader")

const paginatePageNumbersDiv = document.querySelector(".paginate_page_numbers")
const paginatePrevPageBtn = document.querySelector(".paginate_prev_btn")
const paginateNextPageBtn = document.querySelector(".paginate_next_btn")

const numbersCount = 5

let currentNumbersStart = 1
let currentNumbersEnd = 5

let paginateNumbersSpans = []

let currentPageNumber = 1
let totalResults = 0

let currentPageSpan = null

let limitItemsPerPage = 10
let offsetItemsPerPage = 0

let maxPageNumber = 1


searchInput.addEventListener("input", debouncedTimeout(onSearch, 1000))
paginatePageNumbersDiv.addEventListener("click", onChangePage)
paginatePrevPageBtn.addEventListener("click", onSetPaginateNumbers.bind(null, "PREV"))
paginateNextPageBtn.addEventListener("click", onSetPaginateNumbers.bind(null, "NEXT"))


async function onSearch(event) {
   const value = event.target.value

   if (value === "") return

   clearContainer(searchResultsListUl)

   currentPageNumber = 1
   currentPageSpan = null
   totalResults = 0

   const { data, info } = await searchWikipedia(value, { limit: limitItemsPerPage, offset: offsetItemsPerPage })

   totalResults = info.totalhits

   if (totalResults > 0) {
      setSearchResultsCount(info.totalhits)
      displaySearchResults(data)
      removePaginateNumbers()
      createPaginateNumbers()
   }
}


function displaySearchResults(dataArray) {
   for (const item of dataArray) {
      searchResultsListUl.append(createSearchResultItem(item))
   }
}


async function onChangePage(event) {
   if (event.target.tagName !== "SPAN") return

   const pageNumber = Number(event.target.getAttribute("data-page-number"))

   // if (pageNumber === maxPageNumber) {
   //    currentNumbersStart = maxPageNumber
   //    currentNumbersEnd = maxPageNumber
   //    onSetPaginateNumbers("PREV")
   //    // alert()
   // }

   currentPageSpan.classList.remove("page_active")

   currentPageSpan = event.target

   currentPageSpan.classList.add("page_active")

   currentPageNumber = pageNumber

   let limit = limitItemsPerPage
   let offset = (limitItemsPerPage * currentPageNumber) - limitItemsPerPage

   clearContainer(searchResultsListUl)

   const { data, info } = await searchWikipedia(searchInput.value, { limit: limit, offset: offset })

   setSearchResultsCount(info.totalhits)
   displaySearchResults(data)
}

async function searchWikipedia(searchQuery, options) {
   const endpoint = appConfig.searchWikipediaUrl(searchQuery, options);

   loaderDiv.classList.remove("hide")

   const result = await fetcher(endpoint)

   loaderDiv.classList.add("hide")

   return {
      data: result.query.search,
      info: result.query.searchinfo
   }
}


function createSearchResultItem(item) {
   const wrapperLi = document.createElement('li')
   const titleH3 = document.createElement('h3')
   const snippetDiv = document.createElement('div')
   const wikipediaPageA = document.createElement('a')

   titleH3.textContent = item.title
   wikipediaPageA.textContent = "Read More"

   snippetDiv.insertAdjacentHTML("afterbegin", item.snippet)

   wrapperLi.className = "search_result_item"

   wikipediaPageA.href = `${appConfig.wikipediaPageUrl(item.pageid)}`

   wikipediaPageA.target = "_blank"

   wrapperLi.append(titleH3, snippetDiv, wikipediaPageA)

   return wrapperLi
}

function setSearchResultsCount(count) {
   resultsCountH4.textContent = `Results: ${count} (10 results per page)`
}

function removePaginateNumbers() {
   for (const numberSpan of paginateNumbersSpans) {
      numberSpan.remove()
   }

   paginatePrevPageBtn.classList.add("hide")
   paginateNextPageBtn.classList.add("hide")

   currentNumbersStart = 1
   currentNumbersEnd = 5

   paginateNumbersSpans = []

   currentPageNumber = 1
   currentPageSpan = null
}

function createPaginateNumbers() {
   paginatePrevPageBtn.classList.remove("hide")
   paginateNextPageBtn.classList.remove("hide")

   for (let i = 0; i < numbersCount; i++) {
      const numberSpan = document.createElement("span")
      numberSpan.setAttribute("data-page-number", i + 1)
      numberSpan.textContent = i + 1
      paginatePageNumbersDiv.append(numberSpan)

      paginateNumbersSpans.push(numberSpan)

      if (i === 0) {
         numberSpan.classList.add("page_active")
         currentPageSpan = numberSpan
      }
   }

   maxPageNumber = Math.ceil(totalResults / limitItemsPerPage)


   // const spadeSmall = document.createElement("small")
   // const lastNumberSpan = document.createElement("span")
   // lastNumberSpan.textContent = maxPageNumber
   // lastNumberSpan.setAttribute("data-page-number", maxPageNumber)
   // spadeSmall.textContent = "..."
   // paginatePageNumbersDiv.append(spadeSmall, lastNumberSpan)
}



function onSetPaginateNumbers(direction) {
   let count = 0

   maxPageNumber = Math.ceil(totalResults / limitItemsPerPage)

   if (direction === "NEXT") {
      if (maxPageNumber < currentNumbersStart + numbersCount) return

      if (maxPageNumber < currentNumbersEnd + numbersCount) {
         currentNumbersEnd = maxPageNumber
      } else {
         currentNumbersEnd = currentNumbersEnd + numbersCount
      }

      currentNumbersStart = currentNumbersStart + numbersCount
   } else if (direction === "PREV") {
      if (currentNumbersStart === 1) return

      currentNumbersStart = currentNumbersStart - numbersCount
      currentNumbersEnd = currentNumbersEnd - numbersCount + currentNumbersEnd % numbersCount
   }

   for (let i = currentNumbersStart; i <= currentNumbersEnd; i++) {
      if (i === currentPageNumber) {
         paginateNumbersSpans[count].classList.add("page_active")
      }
      else if (paginateNumbersSpans[count].classList.contains("page_active")) {
         paginateNumbersSpans[count].classList.remove("page_active")
      }
      if (paginateNumbersSpans[count].classList.contains("hide")) {
         paginateNumbersSpans[count].classList.remove("hide")
      }

      paginateNumbersSpans[count].setAttribute("data-page-number", i)
      paginateNumbersSpans[count].textContent = i
      count++
   }

   if (count < numbersCount) {
      for (let i = count; i < numbersCount; i++) {
         paginateNumbersSpans[count].classList.add("hide")
         count++
      }
   }
}