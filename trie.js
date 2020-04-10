
class Trie {
	constructor(caseSensitive) {
		this.dictionary = {};
		this.$ = false;
		if (typeof caseSensitive === "undefined") {
			caseSensitive = true;
		}
		this.cs = caseSensitive;
	}
	addString(string) {
		if (this.cs === false) {
			string = string.toLowerCase();
		}

		if (string.length === 0) {
			var wasWord = this.$;
			this.$ = true;
			return wasWord;
		}

		var next = this.dictionary[string[0]];
		if (!next) {
			this.dictionary[string[0]] = new Trie(this.cs);
			next = this.dictionary[string[0]];
		}

		return next.addString(string.substring(1));
	}

	addStrings(list) {
		for (var i in list) {
			this.addString(list[i]);
		}
	}

	keysWithPrefix(prefix) {
		if (this.caseSensitive === false) {
			prefix = prefix.toLowerCase();
		}
		function isEmpty(object) {
			for (var key in object)
				if (object.hasOwnProperty(key))
					return false;
			return true;
		}
		function get(node, word) {
			if (!node)
				return null;
			if (word.length == 0)
				return node;
			return get(node.dictionary[word[0]], word.substring(1));
		}
		function recurse(node, stringAgg, resultsAgg) {
			if (!node)
				return;

			if (node.$) {
				resultsAgg.push(stringAgg);
			}
			if (isEmpty(node.dictionary)) {
				return;
			}
			for (var c in node.dictionary) {
				recurse(node.dictionary[c], stringAgg + c, resultsAgg);
			}
		}
		var results = [];
		recurse(get(this, prefix), prefix, results);
		return results;
	}

	contains(string) {
		if (this.cs === false) {
			string = string.toLowerCase();
		}
		if (string.length === 0) {
			return this.$;
		}
		var firstLetter = string[0];
		var next = this.dictionary[firstLetter];
		if (!next) {
			return false;
		}
		return next.contains(string.substring(1));
	}

	findMatchesOnPath(search) {
		if (this.cs === false) {
			search = search.toLowerCase();
		}
		function recurse(node, search, stringAgg, resultsAgg) {
			if (node.$) {
				resultsAgg.push(stringAgg);
			}

			if (search.length === 0) {
				return resultsAgg;
			}
			var next = node.dictionary[search[0]];
			if (!next) {
				return resultsAgg;
			}
			return recurse(next, search.substring(1), stringAgg + search[0], resultsAgg);
		}
		;
		return recurse(this, search, "", []);
	}

	findPrefix(search) {
		if (this.cs === false) {
			search = search.toLowerCase();
		}
		function recurse(node, search, stringAgg, lastWord) {

			if (node.$) {
				lastWord = stringAgg;
			}

			if (search.length === 0) {
				return [lastWord, search];
			}
			var next = node.dictionary[search[0]];
			if (!next) {
				return [lastWord, search];
			}
			return recurse(next, search.substring(1), stringAgg + search[0], lastWord);
		}
		;
		return recurse(this, search, "", null);
	}

	getSize() {
		var total = 1;
		for (var c in this.dictionary) {
			total += this.dictionary[c].getSize();
		}
		return total;
	}
}

