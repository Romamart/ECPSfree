
window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();


// let url = 

let win_url = window.location.host;

if (win_url.search('www.') != -1 && win_url.search('www.') == 0){
    win_url = win_url.slice(win_url.search('www.')+4);
}
let uni_mask = "/src/len_";
// let file = "/src/list_of_site3.json";

let web_url = window.browser.extension.getURL(uni_mask + win_url.length.toString() + '.json');
alert(win_url);


let xhr = new XMLHttpRequest();

xhr.open('GET', web_url)

xhr.responseType = 'json';

xhr.send();

xhr.onload = function(){
    let text = xhr.response;

    alert(win_url);
    alert(text);
    let min_len = 100;

    for(let st of text){
        let tmp = Hem(st, win_url);
        if (tmp < min_len){
            min_len = tmp;
        }
    }
    
    alert(min_len);





}
// alert(text)

function Hem(str1, str2) {
    let arr1 = str1.split('.'); arr2 = str2.split('.'); count = 0;

    if (arr1.length == arr2.length){

        Total: for (let i = 0; i < arr1.length; i++){
                if (arr1[i].length == arr2[i].length){
                    for (let j = 0; j < arr1[i].length; j++){
                        if (arr1[i][j] != arr2[i][j]) ++count;
                }

            }else {
                count = undefined;
                break Total;
            }
        }
    }else count = undefined;
    return count;
}

// let str1 = 'vk1.com', str2 = 'vk.com';

// console.log(Hem(str1,str2))
    