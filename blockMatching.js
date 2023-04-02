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

const checkListStartAsterisk = checkBlockMatch(/^\s*\*/s)
const checkListStartDash = checkBlockMatch(/^\s*-/s)

const checkListStart = checkMultipleChoiceStart([checkListStartAsterisk, checkListStartDash])
const checkBlockQuoteStart = checkBlockMatch(/^\s*>/s)
const checkOrderedListStart = checkBlockMatch(/^\s*\d/s)

module.exports =  { checkListStart, checkBlockQuoteStart, checkOrderedListStart };