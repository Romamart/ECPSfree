let go = async function(result, rej){
    // var text = 'как записать строку в файл ".txt" с помощью js?';
    var text = await my_str;
    document.write(
        '<a href="data:text/plain;charset=utf-8,%EF%BB%BF' + encodeURIComponent(text) + '" download="text.txt">text.txt</a>'
    )
}

go();