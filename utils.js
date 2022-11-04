export function debouncedTimeout(callback, delay) {
   // console.log("timeout is initial run: ", delay);
   let timeout;

   return function (...args) {
      if (timeout) {
         clearTimeout(timeout);
         // console.log("timeout is cancel")
      }

      timeout = setTimeout(() => {
         callback.apply(null, args)
      }, delay);
   }
}

export function clearContainer(selector) {
   const container = typeof selector === "string" ? document.querySelector(selector) : selector

   while (container.firstChild) {
      container.firstChild.remove()
   }
}

export async function fetcher(url, options = {}) {

   try {
      const response = await fetch(url);
      if (!response.ok) {
         throw Error(response.statusText);
      }
      const data = await response.json();

      console.log(data)
      return data;

   } catch (error) {
      alert(error.message)
   }
}