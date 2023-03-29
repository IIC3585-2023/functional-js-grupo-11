const fs = require('fs');

const countChar = (char) = (str) =>{
    return (str) => {
        if (!str) return 0;
        return str[0] == char ? 1 + countChars(char, str.slice(1)) : 0
    }
}
const countChars = (char, str) => {
    if (!str) return 0;
    return str[0] == char ? 1 + countChars(char, str.slice(1)) : 0
}

const headerTransformer = (str) => {
    const count = countChars('#', str)
    const lTag = "<h" + count + ">"
    const rTag = "</h" + count + ">"
    return count ? lTag + applyEmphasisTransformers(str.slice(count + 1)) + rTag : str
}

const listTransformer = (markdownBlock) => {
    if (markdownBlock[0] != "*") return markdownBlock
    lines = markdownBlock.split('\n')
    html = lines.reduce((previous, current) => {
        current_indent = countChars(' ', current)
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
    if (markdownBlock[0] != ">") return markdownBlock
    lines = markdownBlock.split('\n')
    html = lines.reduce((previous, current) => {
        // console.log([previous, current])
        current_indent = countChars('>', current);
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

const applyEmphasisTransformers = (transformers) = (markdownBlock) => {
    return markdownBlock
}

const applyTypeTransformers = (transformers) =>{
        return (markdownBlock) => {
            return transformers.reduce((str, fn) => fn(str), markdownBlock);
        }
}


const markdownBlockToHTML = (markdownBlock) => {

    typeTransformer = applyTypeTransformers([headerTransformer, listTransformer, blockquoteTransformer])

    val = typeTransformer(markdownBlock)
    return val
}


const markdownToHTML = (markdownText) => {
    return markdownText.split('\n\n')
        .map(markdown => markdownBlockToHTML(markdown))
}

data = fs.readFileSync('test.md', 'utf8')

html = markdownToHTML(data)

fs.writeFileSync('o.html', html.join('\n'))
// const pipeline = pipe([find_blocks, blocks => blocks.foreach(parse_block)])
// EL output de find_blocks lo parseamos con parse_blocks, despues juntamos el output de todas esas llamadas y retornamos eso