window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();


let rule_2 = /[а-яА-Яa-zA-Z]+/g;
let s = ((document.body.innerText) ? document.body.innerText : document.body.textContent).match(rule_2);
let arr = [
           s.filter(function(word){return word.match(/[a-zA-Z]+/)}),
           s.filter(function(word){return word.match(/[а-яА-Я]+/)})
          ]


let check_url = new Promise(function(resalt,rej){
    let bounds = [[4, 6],[7, 9],[10, 12],[13, 15],
                [16, 18],[19, 21],[22, 24],[25, 27],
                [28, 30],[31, 33],[34, 36],[37, 39],
                [40, 42],[43, 45],[46, 48],[49, 51],
                [52, 54],[55, 58],[59, 63],[64, 73]]

    let mask = 'src/json/len_';

    let win_url = window.location.host;
    if (win_url.search('www.') != -1 && win_url.search('www.') == 0){
        win_url = win_url.slice(win_url.search('www.')+4);
    }

    for(let x = 0; x < bounds.length; x++){
        if (win_url.length >= bounds[x][0] && win_url.length <= bounds[x][1]){
            mask += `${bounds[x][0]}-${bounds[x][1]}.json`;
        }
    }

    
    let web_url = window.browser.extension.getURL(mask);

    load(web_url, function(err, urls){
        // console.log(typeof(urls));
        let spellcheck = new Spellcheck(urls);
        var res = spellcheck.getCorrections(win_url, 1);
        resalt(res);
    }, 'json');
});


let check_date = new Promise(function(resalt,res){
    
});

let job = async function(){
    let rule_2 = /[а-яА-Яa-zA-Z]+/g;
    let s = ((document.body.innerText) ? document.body.innerText : document.body.textContent).match(rule_2);
    let arr = [
           s.filter(function(word){return word.match(/[a-zA-Z]+/)}),
           s.filter(function(word){return word.match(/[а-яА-Я]+/)})
          ];
    console.log('yes');
    let url_res = await check_url;

    let count_en = 0, count_ru = 0;
    console.log('yes');
    if (arr[0].length != 0)
        count_en = await checktypos('en', arr[0]);
    console.log('yes');
    if (arr[1].length != 0)
        count_ru = await checktypos("ru", arr[1]);
    console.log('yes');
    console.log(url_res);
    console.log(count_en);
    // let count_ru = await checktypos('ru', ['Привпауаты'])
    console.log(count_ru);
}

job();