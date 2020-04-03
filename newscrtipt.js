let file = "/src/list_of_site3.json";
var myObj;
var xmlhttp = new XMLHttpRequest();
 
xmlhttp.onreadystatechange = function()
{
    if (this.readyState == 4 && this.status == 200)
    {
        myObj = JSON.parse(this.responseText);
    }
};
xmlhttp.open("GET", file, true);
xmlhttp.send();
console.log('Ok')