

class Spellcheck {
    constructor(wordlist) {
        this.trie = new Trie();
        this.trie.addStrings(wordlist);
        this.word2frequency = {};
        for (var i in wordlist) {
            if (!this.word2frequency[wordlist[i]]) {
                this.word2frequency[wordlist[i]] = 0;
            }
            this.word2frequency[wordlist[i]]++;
        }
    }
    isCorrect(word) {
        return this.trie.contains(word);
    }
   
    getCorrections(word, maxDistance) {
        var self = this;
        word = word.toLowerCase();
        if (!maxDistance)
            maxDistance = 1;
        var edits = this.editsWithMaxDistance(word, maxDistance);
        edits = edits.slice(1, edits.length);
        edits = edits.map(function (editList) {
            return editList.filter(function (word) { return self.isCorrect(word); })
                .map(function (word) {return [word, self.word2frequency[word]]; })
                .sort(function (a, b) { return a[1] > b[1] ? -1 : 1; })
                .map(function (wordscore) {return wordscore[0]; });
        });
        edits.length !=0
        var flattened = [];
        for (var i in edits) {
            if (edits[i].length)
                flattened = flattened.concat(edits[i]);
        }
        if (flattened.length != 0){    // console.log(flattened);
            // console.log('yes'
            flattened = flattened.filter(function (v, i, a) { return a.indexOf(v) == i; });
            if (flattened.indexOf(word) != -1){
                return true;
            }else return false;
        }else {return null};
    }
    
    edits(word) {
        var alphabet = '2108&c-pointh6s,45d3mrgl79a\'\.bfuvw\/eqykxjz!';
        var edits = [];
        for (var i = 0; i < word.length + 1; i++) {
            if (i > 0)
                edits.push(word.slice(0, i - 1) + word.slice(i, word.length));
            if (i > 0 && i < word.length + 1)
                edits.push(word.slice(0, i - 1) + word.slice(i, i + 1) + word.slice(i - 1, i) + word.slice(i + 1, word.length)); 
            for (var k = 0; k < alphabet.length; k++) {
                if (i > 0)
                    edits.push(word.slice(0, i - 1) + alphabet[k] + word.slice(i, word.length));
                edits.push(word.slice(0, i) + alphabet[k] + word.slice(i, word.length)); 
            }
        }

        edits = edits.filter(function (v, i, a) { return a.indexOf(v) == i; });
        return edits;
    }
    editsWithMaxDistance(word, distance) {
        return this.editsWithMaxDistanceHelper(distance, [[word]]);
    }
    editsWithMaxDistanceHelper(distanceCounter, distance2edits) {
        // console.log(distance2edits);
        if (distanceCounter == 0)
            return distance2edits;
        var currentDepth = distance2edits.length - 1;
        var words = distance2edits[currentDepth];
        var edits = this.edits(words[0]);
        distance2edits[currentDepth + 1] = [];
        for (var i in words) {
            distance2edits[currentDepth + 1] = distance2edits[currentDepth + 1].concat(this.edits(words[i]));
        }
        // console.log(distance2edits);
        return this.editsWithMaxDistanceHelper(distanceCounter - 1, distance2edits);
    }
}

