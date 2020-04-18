let load = function(url, callback, resp = ''){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    if (resp == 'json'){
        xhr.responseType = resp;
    }
    xhr.onload = function (e) {
    if (xhr.response) {
        callback && callback(null, xhr.response);
    }
    };

    xhr.send();
};