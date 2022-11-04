export const appConfig = {
   searchWikipediaUrl: function (searchQuery, { limit, offset }) {
      return `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&sroffset=${offset || 0}&srlimit=${limit || 5}&srsearch=${searchQuery}`
   },
   wikipediaPageUrl: function (pageId) {
      return `https://en.wikipedia.org/?curid=${pageId}`
   }
}