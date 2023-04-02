const fs = require('fs');
const functions = require('./functions.js');

const filePath = 'sample_test.md';
const data = fs.readFileSync(filePath, 'utf-8');
const transformedHtml = functions.markdownToHTML(data);
fs.writeFileSync('output.html', transformedHtml);