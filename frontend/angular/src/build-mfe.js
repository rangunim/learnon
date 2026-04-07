const fs = require('fs');
const path = require('path');

// Skrypt łączący wygenerowany CSS z main.js dla Web Componentu
const distDir = path.join(__dirname, 'dist', 'learnon', 'browser');
const jsPath = path.join(distDir, 'main.js');
const cssPath = path.join(distDir, 'styles.css');
const outPath = path.join(distDir, 'learnon.js');

if (!fs.existsSync(jsPath)) {
    console.error('Błąd: nie znaleziono pliku main.js w ' + jsPath);
    process.exit(1);
}

const jsBundle = fs.readFileSync(jsPath, 'utf8');

let styleInjector = '';
if (fs.existsSync(cssPath)) {
    const cssContext = fs.readFileSync(cssPath, 'utf8');
    // Zabezpieczenie przed znakami nowej linii, backtickami i znakami dolara w kodzie używanym w template string
    const safeCss = cssContext.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

    styleInjector = `
  (function() {
    const style = document.createElement('style');
    style.setAttribute('data-mfe', 'learnon');
    style.textContent = \`${safeCss}\`;
    document.head.appendChild(style);
  })();
  `;
    console.log('Znaleziono i dodano styles.css');
} else {
    console.warn('Ostrzeżenie: Plik styles.css nie istnieje w ' + cssPath);
}

fs.writeFileSync(outPath, styleInjector + '\n' + jsBundle);
console.log('Gotowe! Wygenerowano plik', outPath);
