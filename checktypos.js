function checktypos(lang,words_array){

    if (words_array.length != 0){
        let mask = 'src/dict/';
        let url_dic = window.browser.extension.getURL(mask + lang +'.dic');
        let url_aff = window.browser.extension.getURL(mask + lang +'.aff');
        var aff = new Promise(function(res,err){
            load(url_aff, function(err, text){
                if (err){
                    console.log(err);
                };
                res(text);
                
            });
        });
        var dic = new Promise(function(res,err){
            load(url_dic, function(err, text){
                if (err){
                    console.log(err);
                };
                res(text);
                
            });
        });

        let do_it = async function(words_array){
            let count = 0;
  
            let dict_aff = await aff;
            let dict_dic = await dic;
            let spellchecker = new Spellchecker();
            var DICT = spellchecker.parse({
                    aff: dict_aff,
                    dic: dict_dic
                });
            spellchecker.use(DICT);
            for (let word of words_array){
                if (word.length > 5){
                    if (!spellchecker.check(word)){
                        if (spellchecker.suggest(word).length != 0){
                            count++;
                        }
                    }
                }
            }
            delete spellchecker;
            delete DICT;
            return count;
        };

        return new Promise(function(resalt, err){
            resalt(do_it(words_array));
        });
    }else
        return new Promise(function(resalt, err){
            resalt(0);
        });
};