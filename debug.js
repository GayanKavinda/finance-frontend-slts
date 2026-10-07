const fs = require('fs');
const code = fs.readFileSync('src/app/contractor-bills/page.js', 'utf8');

// Check for common issues
console.log('File length:', code.length);
console.log('Last 200 chars:', JSON.stringify(code.slice(-200)));

// Find all occurrences of certain patterns
const lines = code.split('\n');
console.log('Total lines:', lines.length);

// Check for unclosed template literals
let inTemplate = false;
for (let i = 0; i < code.length; i++) {
  if (code[i] === '`' && (i === 0 || code[i-1] !== '\\')) {
    inTemplate = !inTemplate;
  }
}
console.log('Unclosed template literal:', inTemplate);

// Check for unclosed parentheses in JSX
const openParens = (code.match(/\(/g) || []).length;
const closeParens = (code.match(/\)/g) || []).length;
console.log('Parens balance:', openParens - closeParens);

// Check for unclosed braces in JS expressions (not JSX attributes)
// This is tricky, but let's look for obvious issues

// Check for the specific error - maybe there's an issue with the last few lines
const lastLines = lines.slice(-10);
console.log('Last 10 lines:');
lastLines.forEach((line, i) => {
  console.log(`${lines.length - 10 + i + 1}: ${JSON.stringify(line)}`);
});
