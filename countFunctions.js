const countChar = (char) => (str) => {
    if (!str) return 0;
    return str[0] == char ? 1 + countChar(char)(str.slice(1)) : 0
}

const countHashes = countChar('#')
const countSpaces = countChar(' ')
const countGT = countChar('>')

module.exports =  { countHashes, countSpaces, countGT };