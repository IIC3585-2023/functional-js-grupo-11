const { checkListStart } = require("./blockMatching.js")
const { countHashes, countSpaces, countGT } = require("./countFunctions.js")
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

const createBloquedSection = (markdownBlock, htmltag1, htmltag2, charCountFunction, indentation) => {
    if (!checkListStart(markdownBlock)) { return markdownBlock }

    lines = markdownBlock.split('\n')
    html = lines.reduce((previous, current) => {
        if (!current) { return previous }

        current_indent = charCountFunction(current)
        const [previous_text, previous_indent] = previous
        trimmed_current = current.slice(current_indent + 1)
        return [
                previous_text + '\n' + ((current_indent > previous_indent) ? `<${htmltag1}>`.repeat((current_indent - previous_indent) / indentation ) : 
                                       ((current_indent < previous_indent) ? `</${htmltag1}>`.repeat((previous_indent - current_indent) / indentation) : '')) 
                                       + `<${htmltag2}>` + applyEmphasisTransformers(trimmed_current) + `</${htmltag1}>`
                , current_indent]
    }, ["", -indentation])
    return html[0] + `</${htmltag1}>`.repeat( (html[1]+indentation)/indentation)
}

const listTransformer = (markdownBlock) => {
    return createBloquedSection(markdownBlock, "ul", "li", countSpaces, 4)
}

const blockquoteTransformer = (markdownBlock) => {
    return createBloquedSection(markdownBlock, "blockquote", "blockquote", countGT, 0)
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
const applyBlockTypeTransformers = applyTypeTransformers([headerTransformer, listTransformer, blockquoteTransformer, pTransformer], true)

module.exports =  { applyBlockTypeTransformers };