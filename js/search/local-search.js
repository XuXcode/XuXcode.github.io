class LocalSearch {
constructor ({
path = '',
unescape = false,
top_n_per_article = 1
}) {
this.path = path
this.unescape = unescape
this.top_n_per_article = top_n_per_article
this.isfetched = false
this.datas = null
}
getIndexByWord (words, text, caseSensitive = false) {
const index = []
const included = new Set()
if (!caseSensitive) {
text = text.toLowerCase()
}
words.forEach(word => {
if (this.unescape) {
const div = document.createElement('div')
div.innerText = word
word = div.innerHTML
}
const wordLen = word.length
if (wordLen === 0) return
let startPosition = 0
let position = -1
if (!caseSensitive) {
word = word.toLowerCase()
}
while ((position = text.indexOf(word, startPosition)) > -1) {
index.push({ position, word })
included.add(word)
startPosition = position + wordLen
}
})
index.sort((left, right) => {
if (left.position !== right.position) {
return left.position - right.position
}
return right.word.length - left.word.length
})
return [index, included]
}
mergeIntoSlice (start, end, index) {
let item = index[0]
let { position, word } = item
const hits = []
const count = new Set()
while (position + word.length <= end && index.length !== 0) {
count.add(word)
hits.push({
position,
length: word.length
})
const wordEnd = position + word.length
index.shift()
while (index.length !== 0) {
item = index[0]
position = item.position
word = item.word
if (wordEnd > position) {
index.shift()
} else {
break
}
}
}
return {
hits,
start,
end,
count: count.size
}
}
highlightKeyword (val, slice) {
let result = ''
let index = slice.start
for (const { position, length } of slice.hits) {
result += val.substring(index, position)
index = position + length
result += `<mark class="search-keyword">${val.substr(position, length)}</mark>`
}
result += val.substring(index, slice.end)
return result
}
getResultItems (keywords) {
const resultItems = []
this.datas.forEach(({ title, content, url }) => {
const [indexOfTitle, keysOfTitle] = this.getIndexByWord(keywords, title)
const [indexOfContent, keysOfContent] = this.getIndexByWord(keywords, content)
const includedCount = new Set([...keysOfTitle, ...keysOfContent]).size
const hitCount = indexOfTitle.length + indexOfContent.length
if (hitCount === 0) return
const slicesOfTitle = []
if (indexOfTitle.length !== 0) {
slicesOfTitle.push(this.mergeIntoSlice(0, title.length, indexOfTitle))
}
let slicesOfContent = []
while (indexOfContent.length !== 0) {
const item = indexOfContent[0]
const { position } = item
const start = Math.max(0, position - 20)
const end = Math.min(content.length, position + 100)
slicesOfContent.push(this.mergeIntoSlice(start, end, indexOfContent))
}
slicesOfContent.sort((left, right) => {
if (left.count !== right.count) {
return right.count - left.count
} else if (left.hits.length !== right.hits.length) {
return right.hits.length - left.hits.length
}
return left.start - right.start
})
const upperBound = parseInt(this.top_n_per_article, 10)
if (upperBound >= 0) {
slicesOfContent = slicesOfContent.slice(0, upperBound)
}
let resultItem = ''
url = new URL(url, location.origin)
url.searchParams.append('highlight', keywords.join(' '))
if (slicesOfTitle.length !== 0) {
resultItem += `<li class="local-search-hit-item"><a href="${url.href}"><span class="search-result-title">${this.highlightKeyword(title, slicesOfTitle[0])}</span>`
} else {
resultItem += `<li class="local-search-hit-item"><a href="${url.href}"><span class="search-result-title">${title}</span>`
}
slicesOfContent.forEach(slice => {
resultItem += `<p class="search-result">${this.highlightKeyword(content, slice)}...</p>`
})
resultItem += '</a></li>'
resultItems.push({
item: resultItem,
id: resultItems.length,
hitCount,
includedCount
})
})
return resultItems
}
fetchData () {
const isXml = !this.path.endsWith('json')
fetch(this.path)
.then(response => response.text())
.then(res => {
this.isfetched = true
this.datas = isXml
? [...new DOMParser().parseFromString(res, 'text/xml').querySelectorAll('entry')].map(element => ({
title: element.querySelector('title').textContent,
content: element.querySelector('content').textContent,
url: element.querySelector('url').textContent
}))
: JSON.parse(res)
this.datas = this.datas.filter(data => data.title).map(data => {
data.title = data.title.trim()
data.content = data.content ? data.content.trim().replace(/<[^>]+>/g, '') : ''
data.url = decodeURIComponent(data.url).replace(/\/{2,}/g, '/')
return data
})
window.dispatchEvent(new Event('search:loaded'))
})
}
highlightText (node, slice, className) {
const val = node.nodeValue
let index = slice.start
const children = []
for (const { position, length } of slice.hits) {
const text = document.createTextNode(val.substring(index, position))
index = position + length
const mark = document.createElement('mark')
mark.className = className
mark.appendChild(document.createTextNode(val.substr(position, length)))
children.push(text, mark)
}
node.nodeValue = val.substring(index, slice.end)
children.forEach(element => {
node.parentNode.insertBefore(element, node)
})
}
highlightSearchWords (body) {
const params = new URL(location.href).searchParams.get('highlight')
const keywords = params ? params.split(' ') : []
if (!keywords.length || !body) return
const walk = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null)
const allNodes = []
while (walk.nextNode()) {
if (!walk.currentNode.parentNode.matches('button, select, textarea, .mermaid')) allNodes.push(walk.currentNode)
}
allNodes.forEach(node => {
const [indexOfNode] = this.getIndexByWord(keywords, node.nodeValue)
if (!indexOfNode.length) return
const slice = this.mergeIntoSlice(0, node.nodeValue.length, indexOfNode)
this.highlightText(node, slice, 'search-keyword')
})
}
}
window.addEventListener('load', () => {
const { path, top_n_per_article, unescape, languages, pagination } = GLOBAL_CONFIG.localSearch
const enablePagination = pagination && pagination.enable
const localSearch = new LocalSearch({
path,
top_n_per_article,
unescape
})
const input = document.querySelector('.local-search-input input')
const statsItem = document.getElementById('local-search-stats')
const $loadingStatus = document.getElementById('loading-status')
const isXml = !path.endsWith('json')
let currentPage = 0
const hitsPerPage = pagination.hitsPerPage || 10
let currentResultItems = []
if (!enablePagination) {
currentPage = undefined
currentResultItems = undefined
}
const elements = {
get pagination () { return document.getElementById('local-search-pagination') },
get paginationList () { return document.querySelector('#local-search-pagination .ais-Pagination-list') }
}
const toggleResultsVisibility = hasResults => {
if (enablePagination) {
elements.pagination.style.display = hasResults ? '' : 'none'
} else {
elements.pagination.style.display = 'none'
}
}
const renderResults = (searchText, resultItems) => {
const container = document.getElementById('local-search-results')
const itemsToDisplay = enablePagination
? currentResultItems.slice(currentPage * hitsPerPage, (currentPage + 1) * hitsPerPage)
: resultItems
if (enablePagination && itemsToDisplay.length === 0 && currentResultItems.length > 0) {
currentPage = 0
renderResults(searchText, resultItems)
return
}
const numberedItems = itemsToDisplay.map((result, index) => {
const itemNumber = enablePagination
? currentPage * hitsPerPage + index + 1
: index + 1
return result.item.replace(
'<li class="local-search-hit-item">',
`<li class="local-search-hit-item" value="${itemNumber}">`
)
})
container.innerHTML = `<ol class="search-result-list">${numberedItems.join('')}</ol>`
const displayCount = enablePagination ? currentResultItems.length : resultItems.length
const stats = languages.hits_stats.replace(/\$\{hits}/, displayCount)
statsItem.innerHTML = `<hr><div class="search-result-stats">${stats}</div>`
if (enablePagination) {
const nbPages = Math.ceil(currentResultItems.length / hitsPerPage)
renderPagination(currentPage, nbPages, searchText)
}
const hasResults = resultItems.length > 0
toggleResultsVisibility(hasResults)
window.pjax && window.pjax.refresh(container)
}
const renderPagination = (page, nbPages, query) => {
if (nbPages <= 1) {
elements.pagination.style.display = 'none'
elements.paginationList.innerHTML = ''
return
}
elements.pagination.style.display = 'block'
const isFirstPage = page === 0
const isLastPage = page === nbPages - 1
const isMobile = window.innerWidth < 768
const maxVisiblePages = isMobile ? 3 : 5
let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2))
const endPage = Math.min(nbPages - 1, startPage + maxVisiblePages - 1)
if (endPage - startPage + 1 < maxVisiblePages) {
startPage = Math.max(0, endPage - maxVisiblePages + 1)
}
let pagesHTML = ''
if (nbPages > maxVisiblePages && startPage > 0) {
pagesHTML += `
<li class="ais-Pagination-item ais-Pagination-item--page">
<a class="ais-Pagination-link" aria-label="Page 1" href="#" data-page="0">1</a>
</li>`
if (startPage > 1) {
pagesHTML += `
<li class="ais-Pagination-item ais-Pagination-item--ellipsis">
<span class="ais-Pagination-link">...</span>
</li>`
}
}
for (let i = startPage; i <= endPage; i++) {
const isSelected = i === page
if (isSelected) {
pagesHTML += `
<li class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected">
<span class="ais-Pagination-link" aria-label="Page ${i + 1}">${i + 1}</span>
</li>`
} else {
pagesHTML += `
<li class="ais-Pagination-item ais-Pagination-item--page">
<a class="ais-Pagination-link" aria-label="Page ${i + 1}" href="#" data-page="${i}">${i + 1}</a>
</li>`
}
}
if (nbPages > maxVisiblePages && endPage < nbPages - 1) {
if (endPage < nbPages - 2) {
pagesHTML += `
<li class="ais-Pagination-item ais-Pagination-item--ellipsis">
<span class="ais-Pagination-link">...</span>
</li>`
}
pagesHTML += `
<li class="ais-Pagination-item ais-Pagination-item--page">
<a class="ais-Pagination-link" aria-label="Page ${nbPages}" href="#" data-page="${nbPages - 1}">${nbPages}</a>
</li>`
}
if (nbPages > 1) {
elements.paginationList.innerHTML = `
<li class="ais-Pagination-item ais-Pagination-item--previousPage ${isFirstPage ? 'ais-Pagination-item--disabled' : ''}">
${isFirstPage
? '<span class="ais-Pagination-link ais-Pagination-link--disabled" aria-label="Previous Page"><i class="fas fa-angle-left"></i></span>'
: `<a class="ais-Pagination-link" aria-label="Previous Page" href="#" data-page="${page - 1}"><i class="fas fa-angle-left"></i></a>`
}
</li>
${pagesHTML}
<li class="ais-Pagination-item ais-Pagination-item--nextPage ${isLastPage ? 'ais-Pagination-item--disabled' : ''}">
${isLastPage
? '<span class="ais-Pagination-link ais-Pagination-link--disabled" aria-label="Next Page"><i class="fas fa-angle-right"></i></span>'
: `<a class="ais-Pagination-link" aria-label="Next Page" href="#" data-page="${page + 1}"><i class="fas fa-angle-right"></i></a>`
}
</li>`
} else {
elements.pagination.style.display = 'none'
}
}
const clearSearchResults = () => {
const container = document.getElementById('local-search-results')
container.textContent = ''
statsItem.textContent = ''
toggleResultsVisibility(false)
if (enablePagination) {
currentResultItems = []
currentPage = 0
}
}
const showNoResults = searchText => {
const container = document.getElementById('local-search-results')
container.textContent = ''
const statsDiv = document.createElement('div')
statsDiv.className = 'search-result-stats'
statsDiv.textContent = languages.hits_empty.replace(/\$\{query}/, searchText)
statsItem.innerHTML = statsDiv.outerHTML
toggleResultsVisibility(false)
if (enablePagination) {
currentResultItems = []
currentPage = 0
}
}
const inputEventFunction = () => {
if (!localSearch.isfetched) return
let searchText = input.value.trim().toLowerCase()
isXml && (searchText = searchText.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
if (searchText !== '') $loadingStatus.hidden = false
const keywords = searchText.split(/[-\s]+/)
let resultItems = []
if (searchText.length > 0) {
resultItems = localSearch.getResultItems(keywords)
}
if (keywords.length === 1 && keywords[0] === '') {
clearSearchResults()
} else if (resultItems.length === 0) {
showNoResults(searchText)
} else {
resultItems.sort((left, right) => {
if (left.includedCount !== right.includedCount) {
return right.includedCount - left.includedCount
} else if (left.hitCount !== right.hitCount) {
return right.hitCount - left.hitCount
}
return right.id - left.id
})
if (enablePagination) {
currentResultItems = resultItems
currentPage = 0
}
renderResults(searchText, resultItems)
}
$loadingStatus.hidden = true
}
let loadFlag = false
const $searchMask = document.getElementById('search-mask')
const $searchDialog = document.querySelector('#local-search .search-dialog')
const fixSafariHeight = () => {
if (window.innerWidth < 768) {
$searchDialog.style.setProperty('--search-height', window.innerHeight + 'px')
}
}
const openSearch = () => {
btf.overflowPaddingR.add()
btf.animateIn($searchMask, 'to_show 0.5s')
btf.animateIn($searchDialog, 'titleScale 0.5s')
setTimeout(() => { input.focus() }, 300)
if (!loadFlag) {
!localSearch.isfetched && localSearch.fetchData()
input.addEventListener('input', inputEventFunction)
loadFlag = true
}
document.addEventListener('keydown', function f (event) {
if (event.code === 'Escape') {
closeSearch()
document.removeEventListener('keydown', f)
}
})
fixSafariHeight()
window.addEventListener('resize', fixSafariHeight)
}
const closeSearch = () => {
btf.overflowPaddingR.remove()
btf.animateOut($searchDialog, 'search_close .5s')
btf.animateOut($searchMask, 'to_hide 0.5s')
window.removeEventListener('resize', fixSafariHeight)
}
const searchClickFn = () => {
btf.addEventListenerPjax(document.querySelector('#search-button > .search'), 'click', openSearch)
}
const searchFnOnce = () => {
document.querySelector('#local-search .search-close-button').addEventListener('click', closeSearch)
$searchMask.addEventListener('click', closeSearch)
if (GLOBAL_CONFIG.localSearch.preload) {
localSearch.fetchData()
}
localSearch.highlightSearchWords(document.getElementById('article-container'))
if (enablePagination) {
elements.pagination.addEventListener('click', e => {
e.preventDefault()
const link = e.target.closest('a[data-page]')
if (link) {
const page = parseInt(link.dataset.page, 10)
if (!isNaN(page) && currentResultItems.length > 0) {
currentPage = page
renderResults(input.value.trim().toLowerCase(), currentResultItems)
}
}
})
}
toggleResultsVisibility(false)
}
window.addEventListener('search:loaded', () => {
const $loadDataItem = document.getElementById('loading-database')
$loadDataItem.nextElementSibling.style.visibility = 'visible'
$loadDataItem.remove()
})
searchClickFn()
searchFnOnce()
window.addEventListener('pjax:complete', () => {
!btf.isHidden($searchMask) && closeSearch()
localSearch.highlightSearchWords(document.getElementById('article-container'))
searchClickFn()
})
})