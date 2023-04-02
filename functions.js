const { applyBlockTypeTransformers } = require("./transformers.js")


const markdownToHTML = (markdownText) => {
    return markdownText.split('\n')
        .map(markdown => markdownBlockToHTML(markdown))
        .join('\n')
}

const markdownBlockToHTML = (markdownBlock) => {
    return applyBlockTypeTransformers(markdownBlock)
}


module.exports =  { markdownToHTML };