const countChar = (char) => (str) => {
    if (!str) return 0;
    return str[0] == char ? 1 + countChar(char)(str.slice(1)) : 0
}

const countHashes = countChar('#')
const countSpaces = countChar(' ')
const countGT = countChar('>')

const unorderedListPrefixCounter = (line) => 1;

const orderedListPrefixCounter = (line) => {
    if (line.match(/^\s/s)) {
        return orderedListPrefixCounter(line.slice(1))
    }
    return line.match(/^\d/s) ? 1 + orderedListPrefixCounter(line.slice(1)) : 1
}

module.exports =  { countHashes, countSpaces, countGT, unorderedListPrefixCounter, orderedListPrefixCounter};