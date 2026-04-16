const fs = require('fs')
const path = require('path')

// Script to join generated CSS and JS into one bundle.
const distDir = path.join(__dirname, 'dist', 'learnon', 'browser')
const outPath = path.join(distDir, 'learnon.js')

if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exists: ' + distDir)
  process.exit(1)
}

const allFiles = fs.readdirSync(distDir)
  .filter(file => file.endsWith('.js') || file.endsWith('.css'))
  .filter(file => !file.includes('worker'))


const mainFile = allFiles.find(file => /^main([.-])[a-zA-Z0-9]+)?\.js$/.test(file))
if (!mainFile) {
  console.error('Error: main file not found in ' + distDir)
  process.exit(1)
}
console.log('Found main bundle: ', mainFile)

const chunkFiles = allFiles
  .filter(file => /^chunk([.-])[a-zA-Z0-9]+)?\.js$/.test(file))
  .sort()

console.log(`Found  ${chunkFiles.length} chunk files: `, chunkFiles.join(',') || '(none)');

const cssFile = allFiles.find(file => /^styles([.-])[a-zA-Z0-9]+)?\.css$/.test(file))
console.log('Found css file: ', cssFile)

let styleInjector = '';
if (cssFile) {
  const cssContext = fs.readFileSync(path.join(distDir, cssFile), 'utf8');
  // Zabezpieczenie przed znakami nowej linii, backtickami i znakami dolara w kodzie używanym w template string
  const safeCss = cssContext
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  styleInjector = `
  (function() {
    const style = document.createElement('style');
    style.setAttribute('data-mfe', 'learnon');
    style.textContent = \`${safeCss}\`;
    document.head.appendChild(style);
  })();
  `;
  console.log('Found and added css file: ', cssFile);
} else {
  console.warn('Warning: css file not found in ' + distDir);
}

// -- Join in proper order: style -> chunks -> main
const parts = [styleInjector];
for (const chunk of chunkFiles) {
  parts.push(fs.readFileSync(path.join(distDir, chunk), 'utf8'));
}
parts.push(fs.readFileSync(path.join(distDir, mainFile), 'utf8'));


fs.writeFileSync(outPath, parts.join('\n'));
console.log('Ready! Generated file', outPath);
