const fs = require('fs');

// AUXILIARY FUNCTIONS

const countChar = (char) => (str) => {
    if (!str) return 0;
    return str[0] == char ? 1 + countChar(char)(str.slice(1)) : 0
}

const countHashes = countChar('#')
const countSpaces = countChar(' ')
const countGT = countChar('>')

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


// TRANSFORMER FUNCTIONS

const pTransformer = (str) => {
    return '<p>' + applyEmphasisTransformers(str) + '</p>'
}

const headerTransformer = (str) => {
    const count = countHashes(str.trim())
    const lTag = "<h" + count + ">"
    const rTag = "</h" + count + ">"
    return count ? lTag + applyEmphasisTransformers(str.slice(count + 1)) + rTag : str
}

// const listTransformer = (startchecker, tag, prefixCounter) => (markdownBlock) => {
const listTransformer = (markdownBlock) => {
    if (!checkListStart(markdownBlock)) {
        return markdownBlock
    }

    lines = markdownBlock.split('\n')
    html = lines.reduce((previous, current) => {
        if (!current) {
            return previous
        }
        current_indent = countSpaces(current)
        const [previous_text, previous_indent] = previous
        trimmed_current = current.slice(current_indent + 1)
        return [
                previous_text + '\n' + ((current_indent > previous_indent) ? '<ul>'.repeat((current_indent - previous_indent) / 4 ) : 
                                       ((current_indent < previous_indent) ? '</ul>'.repeat((previous_indent - current_indent) / 4) : '')) 
                                       + "<li>" + applyEmphasisTransformers(trimmed_current) + "</li>"
                , current_indent]
    }, ["", -4])
    return html[0] + '</ul>'.repeat(html[1]/4 + 1)
}

// Hacer curry quizas junto con la funcion de arriba
const blockquoteTransformer = (markdownBlock) => {
    if (!checkBlockQuoteStart(markdownBlock)) {
        return markdownBlock
    }

    lines = markdownBlock.split('\n')
    html = lines.reduce((previous, current) => {
        // console.log([previous, current])
        current_indent = countGT(current);
        const [previous_text, previous_indent] = previous
        trimmed_current = current.slice(current_indent + 1)
        return [
            previous_text + '\n' + ((current_indent > previous_indent) ? '<blockquote>'.repeat((current_indent - previous_indent)) : 
                                   ((current_indent < previous_indent) ? '</blockquote>'.repeat((previous_indent - current_indent)) : '')) 
                                   + "" + applyEmphasisTransformers(trimmed_current) + ""
            , current_indent]
    }, ["", 0])
    return html[0] + '</blockquote>'.repeat(html[1])
}

const emphasisTransformer = (markdownBlock) => {
    found = markdownBlock.match(/(\*\*?)(?![\s\*])((?:[\s*]*(?:\\[\\*]|[^\\\s*]))+?)\1/s)
    if(!found) return markdownBlock

    return emphasisTransformer(markdownBlock.slice(0, found.index) + 
                                (found[1] == "**" ? "<strong>" : "<i>") + found[2] +
                                (found[1] == "**" ? "</strong>" : "</i>") +
                                markdownBlock.slice(found[0].length + found.index))
}

const linkTransformer = (markdownBlock) => {
    found = markdownBlock.match(/\[([^\(\)\[\]]*)\]\(([^\[\]\(\)]*)\)/s)
    if(!found) return markdownBlock
    return markdownBlock.slice(0, found.index) + "<a href=" + found[2] + ">" + found[1] + "</a>" + linkTransformer(markdownBlock.slice(found.index + found[0].length))
}

const imageTransformer = (markdownBlock) => {
    found = markdownBlock.match(/!\[([^\(\)\[\]]*)\]\(([^\[\]\(\)]*?)\s*("(?:[^\[\]\(\)"]*?)")?\s*\)/s)
    if(!found) return markdownBlock
    return markdownBlock.slice(0, found.index) + "<img src=" + found[2] + " alt=" + found[1] + " title=" + found[3] + "/>" + imageTransformer(markdownBlock.slice(found.index + found[0].length))
}

const codeTransformer = (markdownBlock) => {
    found = markdownBlock.match(/``([^`]+)``/s)
    if (!found) return markdownBlock
    return markdownBlock.slice(0, found.index) + "<code>" + found[1] + "</code>" + codeTransformer(markdownBlock.slice(found.index + found[0].length))
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

const applyEmphasisTransformers = applyTypeTransformers([emphasisTransformer, imageTransformer, linkTransformer, codeTransformer], false)
const applyBlockTypeTransformers = applyTypeTransformers([headerTransformer, listTransformer, blockquoteTransformer, pTransformer], true)

const markdownBlockToHTML = (markdownBlock) => {
    return applyBlockTypeTransformers(markdownBlock)
}


const markdownToHTML = (markdownText) => {
    // console.log(markdownText.split('\n\n'))
    return markdownText.split('\n\n')
        .map(markdown => markdownBlockToHTML(markdown))
        .join('\n')
}

// text = "My favorite search engine is [Duck Duck Go](https://duckduckgo.com).dasdsadasdas[Duck Duck Go](https://duckduckgo.com)asddsadas"

// console.log(linkTransformer(text))

// text = "dsadsadsaasddasdsa ![The San Juan Mountains are beautiful!](/assets/images/san-juan-mountains.jpg \"San Juan Mountains\")adsdassaddsadsadsa ![The San Juan Mountains are beautiful!](/assets/images/san-juan-mountains.jpg \"San Juan Mountains\")"
// console.log(imageTransformer(text))

// EL output de find_blocks lo parseamos con parse_blocks, despues juntamos el output de todas esas llamadas y retornamos eso

const filePath = 'sample_test.md'
const data = fs.readFileSync(filePath, 'utf-8')
const transformedHtml = markdownToHTML(data)
// console.log(transformedHtml)
fs.writeFileSync('output.html', transformedHtml)
