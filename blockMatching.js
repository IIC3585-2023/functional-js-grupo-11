const checkBlockMatch = (regexp) => (markdownBlock) => {
    if (markdownBlock.match(regexp)) {
        return true
    }
    return false
}

const checkMultipleChoiceStart = (possibleStartCheckers) => (markdownBlock) => {
    if (!possibleStartCheckers.length) {
        return false
    }
    return possibleStartCheckers[0](markdownBlock) ? true : checkMultipleChoiceStart(possibleStartCheckers.slice(1))(markdownBlock)
}

checkListStartAsterisk = checkBlockMatch(/^\s*\*/s)
checkListStartDash = checkBlockMatch(/^\s*-/s)

checkListStart = checkMultipleChoiceStart([checkListStartAsterisk, checkListStartDash])
checkBlockQuoteStart = checkBlockMatch(/^\s*>/s)

module.exports =  { checkListStart };