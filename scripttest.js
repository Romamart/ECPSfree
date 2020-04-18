var domain = 'www.google.com/';
$.ajax({
  url: 'https://htmlweb.ru/analiz/api.php?whois&url=' + domain + '&json',
  // url: 'https://htmlweb.ru/analiz/api.php?bl&url=' + domain + '&json',
  type: 'GET',
  dataType: 'json',
  success: function(res) {
    // using jQuery to find table with class "body_text" and appending it to a page
    console.log(res);
  }
});
// [
//     "load.js",
//     "checktypos.js",
//     "trie.js",
//     "spellcheck.js",
//     "dictionary.js",
//     "index.js",

//     "start.js"
//   ],
