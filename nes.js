fs = require('fs');
var Spellchecker = require("hunspell-spellchecker");

console.log(fs.readFileSync('src/dict/ru_RU_2.aff'));
console.log(fs.readFileSync('src/dict/ru_RU_2.dic'));

var spellchecker = new Spellchecker();

var DICT = spellchecker.parse({
    aff: fs.readFileSync("src/dict/ru_RU_2.aff"),
    dic: fs.readFileSync("src/dict/ru_RU_2.dic")
});

spellchecker.use(DICT);

var isRight = spellchecker.suggest("ПРопвывававы");

console.log(isRight);