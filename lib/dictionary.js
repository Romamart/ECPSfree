
class Dictionary {
    constructor(dict) {
        this.rules = {};
        this.dictionaryTable = {};
        this.compoundRules = [];
        this.compoundRuleCodes = {};
        this.replacementTable = [];
        this.flags = {};
        if (dict)
            this.load(dict);
    }
    
    load(obj) {
        for (var i in obj) {
            this[i] = obj[i];
        }
    }

    toJSON(dictionary) {
        return {
            rules: this.rules,
            dictionaryTable: this.dictionaryTable,
            compoundRules: this.compoundRules,
            compoundRuleCodes: this.compoundRuleCodes,
            replacementTable: this.replacementTable,
            flags: this.flags
        };
    }

    parse(dictionary) {
        if (!dictionary.aff && !dictionary.dic) {
            throw "Invalid dictionary to parse";
        }
        this.rules = this._parseAFF("" + dictionary.aff);
        this.compoundRuleCodes = {};
        for (var i = 0, _len = this.compoundRules.length; i < _len; i++) {
            var rule = this.compoundRules[i];
            for (var j = 0, _jlen = rule.length; j < _jlen; j++) {
                this.compoundRuleCodes[rule[j]] = [];
            }
        }
        if ("ONLYINCOMPOUND" in this.flags) {
            this.compoundRuleCodes[this.flags.ONLYINCOMPOUND] = [];
        }
        this.dictionaryTable = this._parseDIC("" + dictionary.dic);
        for (var i in this.compoundRuleCodes) {
            if (this.compoundRuleCodes[i].length == 0) {
                delete this.compoundRuleCodes[i];
            }
        }

        for (var i = 0, _len = this.compoundRules.length; i < _len; i++) {
            var ruleText = this.compoundRules[i];
            var expressionText = "";
            for (var j = 0, _jlen = ruleText.length; j < _jlen; j++) {
                var character = ruleText[j];
                if (character in this.compoundRuleCodes) {
                    expressionText += "(" + this.compoundRuleCodes[character].join("|") + ")";
                }
                else {
                    expressionText += character;
                }
            }
            this.compoundRules[i] = new RegExp(expressionText, "i");
        }
    }

    _parseAFF(data) {
        var rules = {};
        data = this._removeAffixComments(data);
        var lines = data.split("\n");
        for (var i = 0, _len = lines.length; i < _len; i++) {
            var line = lines[i];
            var definitionParts = line.split(/\s+/);
            var ruleType = definitionParts[0];
            if (ruleType == "PFX" || ruleType == "SFX") {
                var ruleCode = definitionParts[1];
                var combineable = definitionParts[2];
                var numEntries = parseInt(definitionParts[3], 10);
                var entries = [];
                for (var j = i + 1, _jlen = i + 1 + numEntries; j < _jlen; j++) {
                    var line = lines[j];
                    var lineParts = line.split(/\s+/);
                    var charactersToRemove = lineParts[2];
                    var additionParts = lineParts[3].split("/");
                    var charactersToAdd = additionParts[0];
                    if (charactersToAdd === "0")
                        charactersToAdd = "";
                    var continuationClasses = this.parseRuleCodes(additionParts[1]);
                    var regexToMatch = lineParts[4];
                    var entry = {};
                    entry.add = charactersToAdd;
                    if (continuationClasses.length > 0)
                        entry.continuationClasses = continuationClasses;
                    if (regexToMatch !== ".") {
                        if (ruleType === "SFX") {
                            entry.match = new RegExp(regexToMatch + "$");
                        }
                        else {
                            entry.match = new RegExp("^" + regexToMatch);
                        }
                    }
                    if (charactersToRemove != "0") {
                        if (ruleType === "SFX") {
                            entry.remove = new RegExp(charactersToRemove + "$");
                        }
                        else {
                            entry.remove = charactersToRemove;
                        }
                    }
                    entries.push(entry);
                }
                rules[ruleCode] = { "type": ruleType, "combineable": (combineable == "Y"), "entries": entries };
                i += numEntries;
            }
            else if (ruleType === "COMPOUNDRULE") {
                var numEntries = parseInt(definitionParts[1], 10);
                for (var j = i + 1, _jlen = i + 1 + numEntries; j < _jlen; j++) {
                    var line = lines[j];
                    var lineParts = line.split(/\s+/);
                    this.compoundRules.push(lineParts[1]);
                }
                i += numEntries;
            }
            else if (ruleType === "REP") {
                var lineParts = line.split(/\s+/);
                if (lineParts.length === 3) {
                    this.replacementTable.push([lineParts[1], lineParts[2]]);
                }
            }
            else {
                this.flags[ruleType] = definitionParts[1];
            }
        }
        return rules;
    }
    _removeAffixComments(data) {
        data = data.replace(/#.*$/mg, "");
        data = data.replace(/^\s\s*/m, '').replace(/\s\s*$/m, '');
        data = data.replace(/\n{2,}/g, "\n");
        data = data.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        return data;
    }
    _parseDIC(data) {
        data = this._removeDicComments(data);
        var lines = data.split("\n");
        var dictionaryTable = {};
        function addWord(word, rules) {
            if (!(word in dictionaryTable) || typeof dictionaryTable[word] != 'object') {
                dictionaryTable[word] = [];
            }
            dictionaryTable[word].push(rules);
        }
        for (var i = 1, _len = lines.length; i < _len; i++) {
            var line = lines[i];
            var parts = line.split("/", 2);
            var word = parts[0];
            if (parts.length > 1) {
                var ruleCodesArray = this.parseRuleCodes(parts[1]);
                if (!("NEEDAFFIX" in this.flags) || ruleCodesArray.indexOf(this.flags.NEEDAFFIX) == -1) {
                    addWord(word, ruleCodesArray);
                }
                for (var j = 0, _jlen = ruleCodesArray.length; j < _jlen; j++) {
                    var code = ruleCodesArray[j];
                    var rule = this.rules[code];
                    if (rule) {
                        var newWords = this._applyRule(word, rule);
                        for (var ii = 0, _iilen = newWords.length; ii < _iilen; ii++) {
                            var newWord = newWords[ii];
                            addWord(newWord, []);
                            if (rule.combineable) {
                                for (var k = j + 1; k < _jlen; k++) {
                                    var combineCode = ruleCodesArray[k];
                                    var combineRule = this.rules[combineCode];
                                    if (combineRule) {
                                        if (combineRule.combineable && (rule.type != combineRule.type)) {
                                            var otherNewWords = this._applyRule(newWord, combineRule);
                                            for (var iii = 0, _iiilen = otherNewWords.length; iii < _iiilen; iii++) {
                                                var otherNewWord = otherNewWords[iii];
                                                addWord(otherNewWord, []);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (code in this.compoundRuleCodes) {
                        this.compoundRuleCodes[code].push(word);
                    }
                }
            }
            else {
                addWord(word.trim(), []);
            }
        }
        return dictionaryTable;
    }
    _removeDicComments(data) {
        data = data.replace(/^\t.*$/mg, "");
        return data;
        data = data.replace(/^\s\s*/m, '').replace(/\s\s*$/m, '');
        data = data.replace(/\n{2,}/g, "\n");
        data = data.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        return data;
    }
    parseRuleCodes(textCodes) {
        if (!textCodes) {
            return [];
        }
        else if (!("FLAG" in this.flags)) {
            return textCodes.split("");
        }
        else if (this.flags.FLAG === "long") {
            var flags = [];
            for (var i = 0, _len = textCodes.length; i < _len; i += 2) {
                flags.push(textCodes.substr(i, 2));
            }
            return flags;
        }
        else if (this.flags.FLAG === "num") {
            return textCodes.split(",");
        }
    }

    _applyRule(word, rule) {
        var entries = rule.entries;
        var newWords = [];
        for (var i = 0, _len = entries.length; i < _len; i++) {
            var entry = entries[i];
            if (!entry.match || word.match(entry.match)) {
                var newWord = word;
                if (entry.remove) {
                    newWord = newWord.replace(entry.remove, "");
                }
                if (rule.type === "SFX") {
                    newWord = newWord + entry.add;
                }
                else {
                    newWord = entry.add + newWord;
                }
                newWords.push(newWord);
                if ("continuationClasses" in entry) {
                    for (var j = 0, _jlen = entry.continuationClasses.length; j < _jlen; j++) {
                        var continuationRule = this.rules[entry.continuationClasses[j]];
                        if (continuationRule) {
                            newWords = newWords.concat(this._applyRule(newWord, continuationRule));
                        }
                    }
                }
            }
        }
        return newWords;
    }
}











