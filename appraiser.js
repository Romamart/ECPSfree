
window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();



let check_url = new Promise(function(result,rej){
    let bounds = [
                    [1, 3], [4, 6], [7, 9], [10, 12],
                    [13, 15], [16, 18], [19, 21], [22, 24],
                    [25, 27], [28, 30], [31, 33], [34, 36],
                    [37, 39], [40, 42], [43, 49], [50, 62]
                 ];

    let mask = 'src/json/len_';

    let win_url = window.location.host;
    let mas = win_url.split('.');
    let dom = '';
    if (mas.length != 1){
        if (mas[0] == 'www'){
            if (mas.length != 2){
                for(let i = 1; i < mas.length -1; i++){
                    if (i == mas.length - 2){
                        dom += mas[i];
                    }else{
                        dom += mas[i] + '.';
                    }
                }
            }else{
                for(let i = 0; i < mas.length -1; i++){
                    if (i == mas.length - 2){
                        dom += mas[i];
                    }else{
                        dom += mas[i] + '.';
                    }
                }
            }
        }else{
            for(let i = 0; i < mas.length -1; i++){
                if (i == mas.length - 2){
                    dom += mas[i];
                }else{
                    dom += mas[i] + '.';
                }
            }
        }
    }else{
        dom += mas[0];
    }

    win_url = dom;
    let state = false;
    for(let x = 0; x < bounds.length; x++){
        if (win_url.length >= bounds[x][0] && win_url.length <= bounds[x][1]){
            mask += `${bounds[x][0]}-${bounds[x][1]}.json`;
            state = true
        }
    }

    
    let web_url = window.browser.extension.getURL(mask);
    if (state){
        load(web_url, function(err, urls){
            var res;
            if (urls.indexOf(win_url) != -1){
                res = 1;
            }else{
                res = 0;
            }
            result(res);
        }, 'json');
    }else result(0)
});


let check_domain = new Promise(function(result, rej){
    let url = window.browser.extension.getURL("src/json/dom_up.json");

    load(url,function(err,dom_up){
        let up = '.' + document.domain.split('.').pop();
        if (typeof dom_up[up] !== "undefined") {
            if (dom_up[up]){
                result(1);
            }else{
                result(-1);
            }
        }else{
            
            result(0);
        }
    },"json");
});

let check_protocol = new Promise(function(result, rej){
    let protocol_value = true;

    if (window.location.protocol == 'http:'){
        protocol_value = false;
    }
    if (protocol_value){
        result(1);
    }else{
        result(-1)
    }
});

// let check_links = new Promise(function(result,rej){
//     let elems = document.getElementsByTagName('a');
//     let count = 0;
//     for (let elem of elems){
//         let b = elem.attributes;
//         if (b.length <= 3){
//             if ((elems == '')){
//                 if ((typeof b['style'] === 'undefined') || (typeof b['class'] === 'undefined')){
//                     if (elem.href == window.location.href + '#'){
//                         count++;
//                     }
//                 }
//             }
//         }
//     }

//     result(count);
// });

let check_body = new Promise(function(result,rej){
    let flag = true;
    let body = document.getElementsByTagName('body');
    flag = body[0].matches('body[background$="png"')||body[0].matches('body[background$="jpg"')||body[0].style['backgroundImage'] != '';
    if (!flag){
        result(1);
    }else{
        result(-1);
    }
});

let get_text = new Promise(function(result, rej){
    let page_text = (document.body.innerText) ? document.body.innerText : document.body.textContent;
    // console.log(page_text);
    page_text = page_text.replace(/([а-я\w/]+\.){2,6}\w+/g, '');
    page_text = page_text.replace(/http|https/g, '');
    page_text = page_text.replace(/[\d_]/g,'');
    

    let arr_en = page_text.match(/\w+/g);
    let final_arr_en = [];
    if (arr_en){
        for (let word of arr_en){
            if (final_arr_en.indexOf(word) == -1){
                if (word[0] == word[0].toLocaleLowerCase())
                    final_arr_en.push(word)
            }
        }
    }
    let arr_ru = page_text.match(/[а-яА-Я]+/g);
    // console.log(arr_ru);
    let final_arr_ru = [];
    if (arr_ru){
        for (let word of arr_ru){
            if (final_arr_ru.indexOf(word) == -1){
                if (word[0] == word[0].toLocaleLowerCase())
                    final_arr_ru.push(word)
            }
        }
    }
    result([final_arr_en, final_arr_ru]);
});
let check_form = new Promise(function(result, rej){
    let form = document.getElementsByTagName('form');
    let flag = true; 
    if (form.length != 0){
        let pieces = document.domain.split('.');
        for (let j = 0; j < form.length; j++){
            for (let i=0; i < pieces.length-1; i++){
                if (typeof form[j].action == 'string'){
                    if (form[j].action.match(/([\w/]+\.){1,6}\w+/g) != null){
                        if (form[j].action.match(/([\w/]+\.){1,6}\w+/g)[0].search(pieces[i]) == -1){
                            flag = false;
                    
                        }
                    }
                }
            }
        }
    }
    if (flag){
        result(1);
    }else{
        result(-1)
    }
});

let check_other_links = new Promise(function(result, rej){
    let count_pos = 0;
    let count_neg = 0;
    let elems = document.getElementsByTagName('a');
    let pieces = document.domain.split('.');
    if (elems.length != 0){
        for (let elem of elems){
            if (typeof elem.href == 'string'){
                if (elem.href != '' && elem.href != window.location.href + '#'){
                    if (elem.href.length >= 5 && elem.href.slice(0,5) == 'http:'){
                        count_neg++;
                    }else if (elem.href.match(/([\w/]+\.){1,6}\w+/g) != null){
                        if (elem.href.match(/([\w/]+\.){1,6}\w+/g)[0].search(document.domain) != -1){
                            count_pos++;
                        }else{
                            let flag = true;
                            for (let i=0; i < pieces.length-1; i++){
                                if (elem.href.match(/([\w/]+\.){1,6}\w+/g)[0].search(pieces[i]) == -1){
                                    flag = false;
                                }
                            }
                            if (flag){
                                count_pos++;
                            }else{
                                count_neg++;
                            }
                        }
                    }
                }
            }
        }
    }
    if (count_neg != 0){
        result(count_pos/count_neg);
    }else if (count_pos != 0){
        result(count_pos);
    }else{
        result(-1);
    }
})

let check_links_head = new Promise(function(result, rej){
    let links = document.getElementsByTagName('link');
    let count_links_pos = 0;
    let count_links_neg = 0;
    let rule = /https:\/\/([а-я\w\-]+\.){1,6}\w+|http:\/\/([а-я\w\-]+\.){1,6}\w+/g;
    if (links.length != 0){
        let url = window.location.href.match(rule)[0];
        for (let link of links){
            if (link.href.match(rule)!= null){
                let tmp = link.href.match(rule)[0];
                if (url == tmp){
                    count_links_pos++;
                }else{
                    count_links_neg++;
                }
            }
        }
    }
    if (count_links_neg != 0){
        result(count_links_pos/count_links_neg);
    }else if (count_links_pos != 0){
        result(count_links_pos);
    }else{
        result(-1);
    }
});

let job_new = async function(){

    let res_url = await check_url;
    let res_domain = await check_domain;
    let res_protocol = await check_protocol;
    // let res_links = await check_links;
    let res_body = await check_body;
    let mas_words = await get_text;
    let count_en = 0;
    let count_ru = 0;
    if (mas_words[0]){
        count_en = await checktypos('en', mas_words[0]);
    }
    if (mas_words[1]){
        count_ru = await checktypos('ru', mas_words[1]);
    }


    let count = ((mas_words[0].length + mas_words[1].length) != 0)?(count_en + count_ru)/(mas_words[0].length + mas_words[1].length):-1; 
    let res_form = await check_form;
    let res_other_links = await check_other_links;
    let res_links_head = await check_links_head;

    let last_arr = [res_domain, res_url, res_protocol, res_body, count, res_form, res_other_links, res_links_head, count_en + count_ru, mas_words[0].length + mas_words[1].length];
    var model = new NeuralNetwork();
    let li = window.browser.extension.getURL('src/model/model.json');
    load(li, function(err, mod){
        model.fromJSON(mod);

        let per = model.run(last_arr);
        console.log(per);
        if (per > 0.5){
            if (per < 0.7){
                let text = 'С вероятностью более 50% этот сайт является фишиговым. Доверяете ли вы этому сайту?'
                note(text);
            }else{
                let text = 'Очень большая вероятность того, что сайт является фишинговым. Будте осторожны и лучше закройте страницу.'
                note(text);
            }
        }
            
    }, 'json');

};

job_new();