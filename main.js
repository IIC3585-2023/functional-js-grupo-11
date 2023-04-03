const fs = require('fs');
const functions = require('./functions.js');


const testFolder = 'examples/input/'
const outFolder = 'examples/output/'
fs.readdir(testFolder, (err, files) => {
  files.forEach(filePath => {
    const data = fs.readFileSync(testFolder + filePath, 'utf-8');
    const transformedHtml = functions.markdownToHTML(data);
    fs.writeFileSync(outFolder + filePath.split('.')[0] + '.html', transformedHtml);
  });
});

// const filePath = 'examples/input/markdInput_1.md';
// const data = fs.readFileSync(filePath, 'utf-8');
// const transformedHtml = functions.markdownToHTML(data);
// fs.writeFileSync('output.html', transformedHtml);