const fs = require('fs');
const path = require('path');

// Helper to load ES locale file as standard object
function loadLocaleFile(filePath, varName) {
  const content = fs.readFileSync(filePath, 'utf8');
  let cjsContent = content.replace(new RegExp(`export\\s+const\\s+${varName}\\s*=`), `const ${varName} =`);
  cjsContent += `\nmodule.exports = ${varName};`;
  
  const tempPath = path.join(__dirname, `temp_clean_be_${varName}.js`);
  fs.writeFileSync(tempPath, cjsContent, 'utf8');
  
  try {
    const obj = require(tempPath);
    delete require.cache[require.resolve(tempPath)];
    fs.unlinkSync(tempPath);
    return obj;
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    throw err;
  }
}

// Function to delete nested key
function deleteNestedKey(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) return;
    current = current[parts[i]];
  }
  delete current[parts[parts.length - 1]];
}

// Function to prune empty nested objects recursively
function pruneEmptyObjects(obj) {
  let hasDeleted = false;
  for (const k in obj) {
    if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      pruneEmptyObjects(obj[k]);
      if (Object.keys(obj[k]).length === 0) {
        delete obj[k];
        hasDeleted = true;
      }
    }
  }
  if (hasDeleted) {
    pruneEmptyObjects(obj);
  }
}

// Custom serializer to generate beautiful, standard ES modules
function serialize(val, indent = 0) {
  const spaces = ' '.repeat(indent);
  if (typeof val === 'string') {
    return JSON.stringify(val);
  }
  if (typeof val === 'object' && val !== null) {
    if (Array.isArray(val)) {
      return '[\n' + val.map(item => ' '.repeat(indent + 2) + serialize(item, indent + 2)).join(',\n') + '\n' + spaces + ']';
    }
    const keys = Object.keys(val);
    if (keys.length === 0) return '{}';
    
    let str = '{\n';
    keys.forEach((k, idx) => {
      const escapedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      str += ' '.repeat(indent + 2) + escapedKey + ': ' + serialize(val[k], indent + 2);
      if (idx < keys.length - 1) str += ',\n';
      else str += '\n';
    });
    str += spaces + '}';
    return str;
  }
  return String(val);
}

const reportPath = path.join(__dirname, 'unused_backend_keys_report.json');
if (!fs.existsSync(reportPath)) {
  console.error('Error: unused_backend_keys_report.json does not exist. Run analyze_backend_locales.js first.');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const unusedKeys = report.unusedKeys;

if (unusedKeys.length === 0) {
  console.log('No unused backend keys found to clean!');
  process.exit(0);
}

const beDir = path.join(__dirname, 'backend');
const enPath = path.join(beDir, 'locales', 'en.js');
const viPath = path.join(beDir, 'locales', 'vi.js');
const krPath = path.join(beDir, 'locales', 'kr.js');

console.log(`Loading backend en.js, vi.js, and kr.js...`);
const enObj = loadLocaleFile(enPath, 'en');
const viObj = loadLocaleFile(viPath, 'vi');
const krObj = loadLocaleFile(krPath, 'ko');

console.log(`Deleting ${unusedKeys.length} unused backend keys...`);
unusedKeys.forEach(key => {
  deleteNestedKey(enObj, key);
  deleteNestedKey(viObj, key);
  deleteNestedKey(krObj, key);
});

console.log('Pruning empty parent nodes...');
pruneEmptyObjects(enObj);
pruneEmptyObjects(viObj);
pruneEmptyObjects(krObj);

// Generate clean file contents
const newEnContent = `// English translations for Backend\nexport const en = ${serialize(enObj, 0)};\n`;
const newViContent = `// Vietnamese translations for Backend\nexport const vi = ${serialize(viObj, 0)};\n`;
const newKrContent = `// Korean translations for Backend\nexport const ko = ${serialize(krObj, 0)};\n`;

// Write to files
console.log('Writing updated backend en.js...');
fs.writeFileSync(enPath, newEnContent, 'utf8');

console.log('Writing updated backend vi.js...');
fs.writeFileSync(viPath, newViContent, 'utf8');

console.log('Writing updated backend kr.js...');
fs.writeFileSync(krPath, newKrContent, 'utf8');

console.log('\nSUCCESS! Cleaned Backend translation files saved.');
