count_err = 0;
window.onerror = function(message, source, lineno, colno, error) { 
    count_err++;
    // console.log(co)
    return count_err;
 }