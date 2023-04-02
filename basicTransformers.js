const emphasisTransformer = (markdownBlock) => {
    // Regex que matchea con algo de la forma "*{text}*" o "**{text}**"
    found = markdownBlock.match(/(\*\*?)(?![\s\*])((?:[\s*]*(?:\\[\\*]|[^\\\s*]))+?)\1/s);
    if(!found) return markdownBlock;

    return emphasisTransformer(markdownBlock.slice(0, found.index) + 
                                (found[1] == "**" ? "<strong>" : "<i>") + found[2] +
                                (found[1] == "**" ? "</strong>" : "</i>") +
                                markdownBlock.slice(found[0].length + found.index));
}

const imageTransformer = (markdownBlock) => {
    // Regex que matchea con algo de la forma "![{text}]({text})"
    found = markdownBlock.match(/!\[([^\(\)\[\]]*)\]\(([^\[\]\(\)]*?)\s*("(?:[^\[\]\(\)"]*?)")?\s*\)/s);
    if(!found) return markdownBlock;

    return markdownBlock.slice(0, found.index) + "<img src=" + found[2] + " alt=" + found[1] + " title=" + found[3] + "/>" + imageTransformer(markdownBlock.slice(found.index + found[0].length));
}

const linkTransformer = (markdownBlock) => {
    // Regex que matchea con algo de la forma "[{text}]({text})"
    found = markdownBlock.match(/\[([^\(\)\[\]]*)\]\(([^\[\]\(\)]*)\)/s);
    if(!found) return markdownBlock;

    return markdownBlock.slice(0, found.index) + "<a href=" + found[2] + ">" + found[1] + "</a>" + linkTransformer(markdownBlock.slice(found.index + found[0].length));
}

const codeTransformer = (markdownBlock) => {
    // Regex que matchea con algo de la forma "``{text}``"
    found = markdownBlock.match(/``([^`]+)``/s);
    if (!found) return markdownBlock;

    return markdownBlock.slice(0, found.index) + "<code>" + found[1] + "</code>" + codeTransformer(markdownBlock.slice(found.index + found[0].length));
}

module.exports =  { emphasisTransformer, imageTransformer, linkTransformer, codeTransformer };