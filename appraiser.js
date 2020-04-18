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

    load(web_url, function(err, urls){
        // console.log(typeof(urls));
        let spellcheck = new Spellcheck(urls);
        var res = spellcheck.getCorrections(win_url, 1);
        resalt(res);
    }, 'json');
});


let check_domain = new Promise(function(resalt, rej){
    let url = window.browser.extension.getURL("src/json/dom_up.json");

    load(url,function(err,dom_up){
        let up = '.' + document.domain.split('.').pop();
        if (typeof dom_up[up] !== "undefined") {
            // console.log("yes");
            resalt(dom_up[up]);
        }else{
            
            resalt(false);
        }
        // console.log(dom_up[up]);
    },"json");
});

let check_protocol = new Promise(function(resalt, rej){
    let protocol_value = true;

    if (window.location.protocol == 'http:'){
        protocol_value = false;
    }

    resalt(protocol_value);
});

let check_links = new Promise(function(resalt,rej){
    let elems = document.getElementsByTagName('a');
    let count = 0;
    console.log(elems);
    for (let elem of elems){
        let b = elem.attributes;
        // console.log(typeof(b['href'])) ; 
        // console.log(typeof(b['class'])) ;
        if (b.length <= 3){
            if ((elems == '')){
                if ((typeof b['style'] === 'undefined') || (typeof b['class'] === 'undefined')){
                    if (elem.href == window.location.href + '#'){
                        count++;
                        console.log(elem);
                    }
                }
            }
        }
    }

    resalt(count);
});

let check_body = new Promise(function(resalt,rej){
    let flag = true;
    let body = document.getElementsByTagName('body');
    flag = body[0].matches('body[background$="png"')||body[0].matches('body[background$="jpg"');
    resalt(!flag);
});

let get_text = new Promise(function(resalt, rej){
    let page_text = (document.body.innerText) ? document.body.innerText : document.body.textContent;
    // console.log(page_text);
    page_text = page_text.replace(/([\w/]+\.){2,6}\w+/g, '');
    page_text = page_text.replace(/\d/g,'');
    

    let arr = page_text.match(/\w+/g);
    // console.log(arr);
    let final_arr = [];
    if (arr){
        for (let word of arr){
            if (final_arr.indexOf(word) == -1){
                if (word[0] == word[0].toLocaleLowerCase())
                    final_arr.push(word)
            }
        }
    }
    resalt(final_arr);
});
let check_form = new Promise(function(resalt, rej){
    let form = document.getElementsByTagName('form');
    let flag = true; 
    if (form.length != 0){
        let pieces = document.domain.split('.');
        for (let i=0; i < pieces.length-1; i++){
            // console.log(typeof form[0].action);
            if (form[0].action.match(/([\w/]+\.){1,6}\w+/g)[0].search(pieces[i]) == -1){
                flag = false;
            }
        }
    }
    resalt(flag);
});

let check_other_links = new Promise(function(resalt, rej){
    let count_pos = 0;
    let count_neg = 0;
    let elems = document.getElementsByTagName('a');
    let pieces = document.domain.split('.');
    if (elems.length != 0){
        for (let elem of elems){
            
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
    if (count_neg != 0){
        resalt(count_pos/count_neg);
    }else if (count_pos != 0){
        resalt(count_pos);
    }else{
        resalt(-1);
    }
})

let job_new = async function(){

    let res_url = await check_url;
    let res_domain = await check_domain;
    let res_protocol = await check_protocol;
    let res_links = await check_links;
    let res_body = await check_body;
    let count_en = await checktypos('en', await get_text);
    let res_form = await check_form;
    let res_other_links = await check_other_links;
    // window.onerror = function(message, source, lineno, colno, error) { 
    //     count_err++;
    // // console.log(co)
    // }
    // console.log();
    let str = '';
    let last_arr = [res_domain, res_url, res_protocol, res_links, res_body, count_en, res_form, res_other_links];
    console.log(last_arr);
    str+=window.location.href;
    for(let ar of last_arr){
        str+= '\t' + ar;
    }
    // var a = document.createElement('a');
    // a.innerText = 'text.txt';
    // a.href = `data:text/plain;charset=utf-8,%EF%BB%BF' + ${encodeURIComponent(str)}`;
    // a.download = 'text.txt';
    // // let body = document.getElementsByTagName('body');
    // document.body.prepend(a);
    
    var value = prompt("phishing?",'');
    console.log(value);
    if (value){
        str+= '\t' + value;

        if (confirm("Скачиваем?")){
            document.write(
                '<a href="data:text/plain;charset=utf-8,%EF%BB%BF' + encodeURIComponent(str) + `" download="text${+new Date()}.txt">text.txt</a>`
            )
        }
    }
};

job_new();