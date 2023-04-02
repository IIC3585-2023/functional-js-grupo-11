const markdownToHTML = (markdownText) => {
    return markdownText.split('\n')
        .map(markdown => markdownBlockToHTML(markdown))
        .join('\n')
}

const markdownBlockToHTML = (markdownBlock) => {
    return applyBlockTypeTransformers(markdownBlock)
}

const applyTypeTransformers = (transformers, endEarly) => (markdownBlock) => {
    if (!transformers.length || markdownBlock.match(/^\s*$/s)) {
        return markdownBlock
    }
    const result = transformers[0](markdownBlock)
    return result !== markdownBlock && endEarly ?
           result : 
           applyTypeTransformers(transformers.slice(1), endEarly)(result)
}

// TRANSFORMER FUNCTIONS

const emphasisTransformer = (markdownBlock) => {
    found = markdownBlock.match(/(\*\*?)(?![\s\*])((?:[\s*]*(?:\\[\\*]|[^\\\s*]))+?)\1/s);
    if(!found) return markdownBlock;

    return emphasisTransformer(markdownBlock.slice(0, found.index) + 
                                (found[1] == "**" ? "<strong>" : "<i>") + found[2] +
                                (found[1] == "**" ? "</strong>" : "</i>") +
                                markdownBlock.slice(found[0].length + found.index));
}

const imageTransformer = (markdownBlock) => {
    found = markdownBlock.match(/!\[([^\(\)\[\]]*)\]\(([^\[\]\(\)]*?)\s*("(?:[^\[\]\(\)"]*?)")?\s*\)/s);
    if(!found) return markdownBlock;

    return markdownBlock.slice(0, found.index) + "<img src=" + found[2] + " alt=" + found[1] + " title=" + found[3] + "/>" + imageTransformer(markdownBlock.slice(found.index + found[0].length));
}

const linkTransformer = (markdownBlock) => {
    found = markdownBlock.match(/\[([^\(\)\[\]]*)\]\(([^\[\]\(\)]*)\)/s);
    if(!found) return markdownBlock;

    return markdownBlock.slice(0, found.index) + "<a href=" + found[2] + ">" + found[1] + "</a>" + linkTransformer(markdownBlock.slice(found.index + found[0].length));
}

const codeTransformer = (markdownBlock) => {
    found = markdownBlock.match(/``([^`]+)``/s);
    if (!found) return markdownBlock;

    return markdownBlock.slice(0, found.index) + "<code>" + found[1] + "</code>" + codeTransformer(markdownBlock.slice(found.index + found[0].length));
}

const headerTransformer = (str) => {
    const count = countHashes(str.trim())
    const lTag = "<h" + count + ">"
    const rTag = "</h" + count + ">"
    return count ? lTag + applyEmphasisTransformers(str.slice(count + 1)) + rTag : str
}

const pTransformer = (str) => {
    return '<p>' + applyEmphasisTransformers(str) + '</p>'
}

// TRANSFORMER FUNCTIONS WITH NESTING

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

// COUNT FUNCTIONS

const countChar = (char) => (str) => {
    if (!str) return 0;
    return str[0] == char ? 1 + countChar(char)(str.slice(1)) : 0
}

const countHashes = countChar('#')
const countSpaces = countChar(' ')
const countGT = countChar('>')

// BLOCK MATCHING FUNCTIONS

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

const applyEmphasisTransformers = applyTypeTransformers([emphasisTransformer, imageTransformer, linkTransformer, codeTransformer], false)
const applyBlockTypeTransformers = applyTypeTransformers([headerTransformer, listTransformer, blockquoteTransformer, pTransformer], true)


module.exports =  { markdownToHTML };