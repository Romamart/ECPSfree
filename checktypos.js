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
            // let check_list = [];
            let dict_aff = await aff;
            let dict_dic = await dic;
            let spellchecker = new Spellchecker();
            var DICT = spellchecker.parse({
                    aff: dict_aff,
                    dic: dict_dic
                });
            spellchecker.use(DICT);
            let alph = DICT.flags['TRY'];
            let pair_alph = [];
            for (let i = 0; i < alph.length; i++){
                for (let j = i; j < alph.length; j++){
                    if (j != i){
                        pair_alph.push(alph[i]+alph[j]);
                        pair_alph.push(alph[j]+alph[i]);
                    }else{
                        pair_alph.push(alph[i]+alph[j]);
                    }
                }
            }
            for (let word of words_array){
                // if (lang == 'ru'){
                //     word = word.replace('ё', 'е');
                // }
                let isRight = spellchecker.check(word);
                // if (!spellchecker.check(word)){
                //     if (word.length > 4){
                //         check_pairs: for (let ch = 0; ch < word.length-1; ch++){
                //             for(let i = 0; i < pair_alph.length; i++){
                //                 let check_word;
                //                 if(ch == 0){
                //                     check_word = pair_alph[i] + word.slice(2,word.length+1);
                //                     if (spellchecker.check(check_word)){
                //                         count++;
                //                         console.log(word);
                //                         break check_pairs;
                //                     }
                //                 }else if (ch == word.length-2){
                //                     check_word = word.slice(0, -2) + pair_alph[i];
                //                     if (spellchecker.check(check_word)){
                //                         count++;
                //                         console.log(word);
                //                         break check_pairs;
                //                     }
                //                 }else{
                //                     check_word = word.slice(0,ch) + pair_alph[i] + word.slice(ch+2);
                //                     if (spellchecker.check(check_word)){
                //                         count++;
                //                         console.log(word);
                //                         break check_pairs;
                //                     }
                //                 }
                //             }
                //         }   
                //     }
                //     // console.log(spellchecker.suggest(word));
                //     // if (spellchecker.suggest(word,3).length != 0){
                //     //     count++;
                //     //     console.log(word);
                //     //     check_list.push({word : spellchecker.suggest(word,3)})

                //     // }
                // }
            }
            // console.log(DICT.dictionaryTable['привет']);
            // console.log(DICT.dictionaryTable[words_array[0]]);
            // console.log(DICT.flags);
            console.log(spellchecker.suggest('сорокт',1));
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