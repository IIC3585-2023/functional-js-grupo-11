const { checkListStart, checkBlockQuoteStart, checkOrderedListStart } = require("./blockMatching.js")
const { countHashes, countSpaces, countGT, unorderedListPrefixCounter, orderedListPrefixCounter } = require("./countFunctions.js")
const { emphasisTransformer, imageTransformer, linkTransformer, codeTransformer } = require("./basicTransformers.js")

const headerTransformer = (str) => {
    const count = countHashes(str.trim())
    const lTag = "<h" + count + ">"
    const rTag = "</h" + count + ">"
    return count ? lTag + applyEmphasisTransformers(str.slice(count + 1)) + rTag : str
}

const pTransformer = (str) => {
    return '<p>' + applyEmphasisTransformers(str) + '</p>'
}

const generalListTransformer = (blockStartChecker, itemPrefixLengthChecker, tag) => (markdownBlock) => {
    if (!blockStartChecker(markdownBlock)) {
        return markdownBlock
    }

    lines = markdownBlock.split('\n')
    html = lines.reduce((previous, current) => {
        if (!current) {
            return previous
        }
        current_indent = countSpaces(current)
        const [previous_text, previous_indent] = previous
        const itemPrefixLength = itemPrefixLengthChecker(current)
        trimmed_current = current.slice(current_indent + itemPrefixLength)
        return [
                previous_text + '\n' + ((current_indent > previous_indent) ? `<${tag}>`.repeat((current_indent - previous_indent) / 4 ) : 
                                       ((current_indent < previous_indent) ? `</${tag}>`.repeat((previous_indent - current_indent) / 4) : '')) 
                                       + "<li>" + applyEmphasisTransformers(trimmed_current) + "</li>"
                , current_indent]
    }, ["", -4])
    return html[0] + `</${tag}>`.repeat(html[1] / 4 + 1)
}

const listTransformer = generalListTransformer(checkListStart, unorderedListPrefixCounter, 'ul')
const orderedListTransformer = generalListTransformer(checkOrderedListStart, orderedListPrefixCounter, 'ol')


const blockquoteTransformer = (markdownBlock) => {
    if (!checkBlockQuoteStart(markdownBlock)) {
        return markdownBlock
    }

    lines = markdownBlock.split('\n')
    html = lines.reduce((previous, current) => {
        current_indent = countGT(current);
        const [previous_text, previous_indent] = previous
        trimmed_current = current.slice(current_indent + 1)
        return [
            previous_text + '\n' + ((current_indent > previous_indent) ? '<blockquote>'.repeat((current_indent - previous_indent)) : 
                                   ((current_indent < previous_indent) ? '</blockquote>'.repeat((previous_indent - current_indent)) : '')) 
                                   + "<p>" + applyEmphasisTransformers(trimmed_current) + "</p>"
            , current_indent]
    }, ["", 0])
    return html[0] + '</blockquote>'.repeat(html[1])
}

// APPLY TRANSFORMERS

const applyTypeTransformers = (transformers, endEarly) => (markdownBlock) => {
    if (!transformers.length || markdownBlock.match(/^\s*$/s)) {
        return markdownBlock
    }
    const result = transformers[0](markdownBlock)
    return result !== markdownBlock && endEarly ?
           result : 
           applyTypeTransformers(transformers.slice(1), endEarly)(result)
}

const applyEmphasisTransformers = applyTypeTransformers([emphasisTransformer, imageTransformer, linkTransformer, codeTransformer], false)
const applyBlockTypeTransformers = applyTypeTransformers([headerTransformer, listTransformer, orderedListTransformer, blockquoteTransformer, pTransformer], true)

module.exports =  { applyBlockTypeTransformers };