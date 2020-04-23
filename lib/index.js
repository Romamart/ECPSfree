
class Spellchecker {
    constructor(dictionary) {
        this.dict = null;
        if (dictionary)
            this.use(dictionary);
    }

    use(dictionary) {
        this.dict = new Dictionary(dictionary);
    }

    parse(dictionary) {
        var dict = new Dictionary();
        dict.parse(dictionary);
        this.use(dict);
        return dict.toJSON();
    }
   
    check(aWord) {
        var trimmedWord = aWord.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

        if (this.checkExact(trimmedWord)) {
            return true;
        }

        if (trimmedWord.toUpperCase() === trimmedWord) {
            var capitalizedWord = trimmedWord[0] + trimmedWord.substring(1).toLowerCase();
            if (this.hasFlag(capitalizedWord, "KEEPCASE")) {
                return false;
            }
            if (this.checkExact(capitalizedWord)) {
                return true;
            }
        }

        var lowercaseWord = trimmedWord.toLowerCase();
        if (lowercaseWord !== trimmedWord) {
            if (this.hasFlag(lowercaseWord, "KEEPCASE")) {
                return false;
            }
            if (this.checkExact(lowercaseWord)) {
                return true;
            }
        }
        return false;
    }
    checkExact(word) {
        var ruleCodes = this.dict.dictionaryTable[word];
        if (typeof ruleCodes === 'undefined') {
            if ("COMPOUNDMIN" in this.dict.flags && word.length >= this.dict.flags.COMPOUNDMIN) {
                for (var i = 0, _len = this.dict.compoundRules.length; i < _len; i++) {
                    if (word.match(this.dict.compoundRules[i])) {
                        return true;
                    }
                }
            }
            return false;
        }
        else {
            for (var i = 0, _len = ruleCodes.length; i < _len; i++) {
                if (!this.hasFlag(word, "ONLYINCOMPOUND", ruleCodes[i])) {
                    return true;
                }
            }
            return false;
        }
    }
    hasFlag(word, flag, wordFlags) {
        if (flag in this.dict.flags) {
            if (typeof wordFlags === 'undefined') {
                var wordFlags = Array.prototype.concat.apply([], this.dict.dictionaryTable[word]);
            }
            if (wordFlags && wordFlags.indexOf(this.dict.flags[flag]) !== -1) {
                return true;
            }
        }
        return false;
    }
    suggest(word, limit) {
        if (!limit)
            limit = 5;
        if (this.check(word))
            return [];
        for (var i = 0, _len = this.dict.replacementTable.length; i < _len; i++) {
            var replacementEntry = this.dict.replacementTable[i];
            if (word.indexOf(replacementEntry[0]) !== -1) {
                var correctedWord = word.replace(replacementEntry[0], replacementEntry[1]);
                if (this.check(correctedWord)) {
                    return [correctedWord];
                }
            }
        }
        var self = this;
        var tmp = self.dict.flags["TRY"].toLowerCase();
        var alph = '';
        for (let char of tmp){
            if (alph.search(char) == -1){
                alph += char;
            }
        }
        
        self.dict.alphabet = alph;
        function edits1(words) {
            var rv = [];
            for (var ii = 0, _iilen = words.length; ii < _iilen; ii++) {
                var word = words[ii];
                var splits = [];
                for (var i = 0, _len = word.length + 1; i < _len; i++) {
                    splits.push([word.substring(0, i), word.substring(i, word.length)]);
                }
                var transposes = [];
                for (var i = 0, _len = splits.length; i < _len; i++) {
                    var s = splits[i];
                    if (s[1].length > 1) {
                        transposes.push(s[0] + s[1][1] + s[1][0] + s[1].substring(2));
                    }
                }
                var replaces = [];
                for (var i = 0, _len = splits.length; i < _len; i++) {
                    var s = splits[i];
                    if (s[1]) {
                        for (var j = 0, _jlen = self.dict.alphabet.length; j < _jlen; j++) {
                            replaces.push(s[0] + self.dict.alphabet[j] + s[1].substring(1));
                        }
                    }
                }
                var inserts = [];
                for (var i = 0, _len = splits.length; i < _len; i++) {
                    var s = splits[i];
                    if (s[1]) {
                        for (var j = 0, _jlen = self.dict.alphabet.length; j < _jlen; j++) {
                            replaces.push(s[0] + self.dict.alphabet[j] + s[1]);
                        }
                    }
                }
                rv = rv.concat(transposes);
                rv = rv.concat(replaces);
                rv = rv.concat(inserts);
            }
            return rv;
        }
        function known(words, word) {
            var rv = [];
            for (var i = 0; i < words.length; i++) {
                if (word.length == words[i].length){
                    if (self.check(words[i])) {
                        rv.push(words[i]);
                    }
                }
            }
            return rv;
        }
        function correct(word) {
            var ed1 = edits1([word]);
            var corrections = known(ed1, word);
            var weighted_corrections = {};
            var sum_all = 0;
            for (var i = 0, _len = corrections.length; i < _len; i++) {
                if (!(corrections[i] in weighted_corrections)) {
                    weighted_corrections[corrections[i]] = 1;
                    sum_all++;
                }
                else {
                    weighted_corrections[corrections[i]] += 1;
                    sum_all++;
                }
            }
            var sorted_corrections = [];
            for (var i in weighted_corrections) {
                sorted_corrections.push([i, weighted_corrections[i]/sum_all]);
            }


            function sorter(a, b) {
                if (a[1] < b[1]) {
                    return -1;
                }
                return 1;
            }
            sorted_corrections.sort(sorter).reverse();
            var rv = [];
            for (var i = 0, _len = Math.min(limit, sorted_corrections.length); i < _len; i++) {
                if (!self.hasFlag(sorted_corrections[i][0], "NOSUGGEST")) {
                    rv.push(sorted_corrections[i][0]);
                }
            }
            return rv;
        }
        return correct(word);
    }
}

