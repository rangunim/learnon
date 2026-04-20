const fs = require('fs')
const path = require('path')
const { build } = require('esbuild')

// Script to join generated CSS and JS into one bundle.
const appName = 'learnon';
const distDir = path.join(__dirname, 'dist', appName, 'browser')
const outPath = path.join(distDir, `${appName}.js`)

if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exists: ' + distDir)
  process.exit(1)
}

const allFiles = fs.readdirSync(distDir)
  .filter(file => file.endsWith('.js') || file.endsWith('.css'))
  .filter(file => !file.includes('worker'))


const mainFile = allFiles.find(file => /^main[.-][a-zA-Z0-9]+\.js$/.test(file) || file === 'main.js')
if (!mainFile) {
  console.error('Error: main file not found in ' + distDir)
  process.exit(1)
}
console.log('Found main bundle: ', mainFile)



const cssFile = allFiles.find(file => /^styles[.-][a-zA-Z0-9]+\.css$/.test(file) || file === 'styles.css')
let styleInjector = ''
if (cssFile) {
  const cssContext = fs.readFileSync(path.join(distDir, cssFile), 'utf8');
  // Safe escaping for template string
  const safeCss = cssContext
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')

  styleInjector = `
  (function() {
    if (document.querySelector('style[data-mfe="${appName}"]')) return;
    const style = document.createElement('style');
    style.setAttribute('data-mfe', '${appName}');
    style.textContent = \`${safeCss}\`;
    document.head.appendChild(style);
  })();
  `;
  console.log('Found and added css file: ', cssFile);
} else {
  console.warn('Warning: css file not found in ' + distDir);
}


const inlineLazyPlugin = {
  name: 'inline-lazy',
  setup(build) {
    build.onResolve({ filter: /.*/ }, args => {
      if (args.kind === 'dynamic-import') {
        return {
          path: path.resolve(args.resolveDir, args.path), //find correct chunk file and append it to the bundle
          namespace: 'file'
        };
      }
    });
  },
};

console.log('Bundling all chunks into one file...');

async function run() {
  //esbuild rebundler: flatten all chunks into one file
  const result = await build({
    entryPoints: [path.join(distDir, mainFile)],
    bundle: true,
    format: 'iife', //isolate code to wrap all code in a function
    platform: 'browser',
    outfile: outPath,
    allowOverwrite: true,
    minify: true,
    sourcemap: false,
    plugins: [inlineLazyPlugin],
    banner: {
      js: styleInjector
    }
  })

  if (result.errors.length > 0) {
    console.error('Errors: ', result.errors)
    process.exit(1)
  }

  console.log('Success! Micro Frontend generated at:', outPath);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

/*const chunkFiles = allFiles
  .filter(file => /^chunk[.-][a-zA-Z0-9]+\.js$/.test(file))
  .sort()

console.log(`Found  ${chunkFiles.length} chunk files: `, chunkFiles.join(',') || '(none)');*/

/*

// -- Join in proper order: style -> chunks -> main
const parts = [styleInjector];
for (const chunk of chunkFiles) {
  parts.push(fs.readFileSync(path.join(distDir, chunk), 'utf8'));
}
parts.push(fs.readFileSync(path.join(distDir, mainFile), 'utf8'));


fs.writeFileSync(outPath, parts.join('\n'));
console.log('Ready! Generated file', outPath);
*/