
window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();


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
    

    let xhr = new XMLHttpRequest();
    xhr.open('GET', web_url);
    xhr.responseType = 'json';
    xhr.send();

    xhr.onload = function(){
        let urls = xhr.response;
        let spellcheck = new Spellcheck(urls);
        var res = spellcheck.getCorrections(win_url, 1);
            
        if (res != null){
            if (!res){
                    // count_1++;
                console.log(false);
                    // let tmp = [word, b];
                    // console.log(tmp);
            }else{
                console.log(true);
            }
        }else{ 
            console.log(null);}
            
        resalt(res);

    }
    
});

let check_typos_en =new Promise(function(resalt,rej){
    let web_url_words = window.browser.extension.getURL('src/json/en_words.json');
    
    let rule_2 = /[а-яА-Яa-zA-Z]+/g;
    let s = ((document.body.innerText) ? document.body.innerText : document.body.textContent).match(rule_2);
    let arr = s.filter(function(word){return word.match(/[a-zA-Z]+/)})

    var count_en = 0;
    if (arr.length != 0){

        let xhr2 = new XMLHttpRequest();
        xhr2.open('GET', web_url_words);
        xhr2.responseType = 'json';
        xhr2.send();
        xhr2.onload = function(){
            let words = xhr2.response;
            
            let spellcheck = new Spellcheck(words);
            for (let word of arr){
                let b = spellcheck.getCorrections(word, 1);
                
                if (b != null){
                    if (!b){
                        count_en++;
                        let tmp = [word, b];
                        console.log(tmp);
                    }
                }
            }
            console.log(count_en);
            resalt(count_en);
        }
    }
});

let check_typos_ru = new Promise(function(resalt,rej){
    var count_ru = 0;
    let web_url_dicts = window.browser.extension.getURL("src/dicts/");
    
    let rule_2 = /[а-яА-Яa-zA-Z]+/g;
    let s = ((document.body.innerText) ? document.body.innerText : document.body.textContent).match(rule_2);
    let arr = s.filter(function(word){return word.match(/[а-яА-Я]+/g)})

    if (arr.length != 0){
        Az.Morph.init(web_url_dicts, function() {
            for (let word of arr){
                var parse = Az.Morph(word);
                if (parse.length != 0){
                    let max_score = parse[0].score;
                    let i_max = 0;
                    for (let i = 0; i < parse.length; i++){
                        if (parse[i].score > max_score){
                            max_score = parse[i].score;
                            i_max = i;
                        }
                    }
                    if (parse[i_max].typosCnt != 0 || parse[i_max].stutterCnt != 0){
                        count_ru++;
                        // console.log(word);
                    }
                }
            }
            // console.log(count);
            // console.log(Az.Morph('Ларри'))
            // console.log(Az.Morph('технологии'))
        });

    }
    resalt(count_ru);
});



// console.log(res_url);
// console.log(count_ru);
// console.log(count_en);
    

let end = function(res_url,count_en,count_ru){
    if (res_url == null){
        alert(`Колическтво опечаток ${count_en+count_ru}`);
    }else if (res_url){
        alert('Сайт корректен!');
    }else{
        alert(`Сайт имеет похожий URL, Количество ошибок: ${count_ru+count_en}`)
    }
}


// new Promise(function(res,rej){
//     res = check_url();
// }).then(
//     resalt => check_typos(resalt)
// )
// end(res_url,count_en,count_ru);

// new Promise(function(res,rej){
//     res(check_url());
// }).then(function(res){
//     console.log('1')
//     let count_en = check_typos_en();
//     console.log(count_en) 
//     let count_ru = check_typos_ru();
//     console.log('3');
//     return res, count_en, count_ru;
// }).then(function(res){
//     return end(res)
// });

let all = async function(){
    let res_url = await check_url;
    let count_en = await check_typos_en;
    let count_ru = await check_typos_ru;
    end(res_url, count_en, count_ru);
}
     
all();


// all();