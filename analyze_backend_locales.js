const fs = require('fs');
const path = require('path');

// Helper to load ES locale file as standard object
function loadLocaleFile(filePath, varName) {
  const content = fs.readFileSync(filePath, 'utf8');
  let cjsContent = content.replace(new RegExp(`export\\s+const\\s+${varName}\\s*=`), `const ${varName} =`);
  cjsContent += `\nmodule.exports = ${varName};`;
  
  const tempPath = path.join(__dirname, `temp_scan_be_${varName}.js`);
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

// Flatten nested keys
function flattenKeys(obj, prefix = '') {
  let keys = {};
  for (const k in obj) {
    const val = obj[k];
    const newPrefix = prefix ? `${prefix}.${k}` : k;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(keys, flattenKeys(val, newPrefix));
    } else {
      keys[newPrefix] = val;
    }
  }
  return keys;
}

// Recurse directory and get all JS files
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      if (file !== 'locales' && file !== 'node_modules' && file !== 'uploads' && file !== '.vscode') {
        getFiles(name, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (ext === '.js') {
        fileList.push(name);
      }
    }
  }
  return fileList;
}

const beDir = path.join(__dirname, 'backend');
const enPath = path.join(beDir, 'locales', 'en.js');
const viPath = path.join(beDir, 'locales', 'vi.js');
const krPath = path.join(beDir, 'locales', 'kr.js');

const enObj = loadLocaleFile(enPath, 'en');
const viObj = loadLocaleFile(viPath, 'vi');
const krObj = loadLocaleFile(krPath, 'ko');

const enFlat = flattenKeys(enObj);
const viFlat = flattenKeys(viObj);
const krFlat = flattenKeys(krObj);

const allKeys = new Set([...Object.keys(enFlat), ...Object.keys(viFlat), ...Object.keys(krFlat)]);
const files = getFiles(beDir);

console.log(`Scanning ${files.length} Backend JS files for translation keys...`);

// Preload all file contents
const fileContents = files.map(file => ({
  path: file,
  relPath: path.relative(beDir, file),
  content: fs.readFileSync(file, 'utf8')
}));

// Find all key prefixes
const prefixes = new Set();
for (const key of allKeys) {
  const parts = key.split('.');
  if (parts.length > 1) {
    for (let i = 1; i < parts.length; i++) {
      prefixes.add(parts.slice(0, i).join('.') + '.');
    }
  }
}

const sortedPrefixes = Array.from(prefixes).sort((a, b) => b.length - a.length);

const usedKeys = [];
const dynamicallyUsedKeys = [];
const unusedKeys = [];

const keyUsages = {};

for (const key of allKeys) {
  let isUsed = false;
  let usedInFile = '';
  
  // Check if exact key string appears in any file
  for (const fc of fileContents) {
    if (fc.content.includes(key)) {
      isUsed = true;
      usedInFile = fc.relPath;
      break;
    }
  }
  
  if (isUsed) {
    usedKeys.push(key);
    keyUsages[key] = { type: 'exact', file: usedInFile };
    continue;
  }
  
  // If not found exactly, check for dynamic prefix match in Backend JS files
  let hasDynamicPrefix = false;
  let matchedPrefix = '';
  let prefixUsedInFile = '';
  
  for (const prefix of sortedPrefixes) {
    if (key.startsWith(prefix)) {
      const singleQuotePrefix = `'${prefix}'`;
      const doubleQuotePrefix = `"${prefix}"`;
      const backtickPrefix = `\`${prefix}\``;
      const interpolationPrefix = `\`${prefix}\${`;
      
      for (const fc of fileContents) {
        if (fc.content.includes(singleQuotePrefix) || 
            fc.content.includes(doubleQuotePrefix) || 
            fc.content.includes(backtickPrefix) ||
            fc.content.includes(interpolationPrefix)) {
          hasDynamicPrefix = true;
          matchedPrefix = prefix;
          prefixUsedInFile = fc.relPath;
          break;
        }
      }
      if (hasDynamicPrefix) break;
    }
  }
  
  if (hasDynamicPrefix) {
    dynamicallyUsedKeys.push({ key, prefix: matchedPrefix, file: prefixUsedInFile });
    keyUsages[key] = { type: 'dynamic', prefix: matchedPrefix, file: prefixUsedInFile };
  } else {
    unusedKeys.push(key);
  }
}

console.log('\n--- BE ANALYSIS REPORT ---');
console.log(`Total Keys: ${allKeys.size}`);
console.log(`Used keys (exactly referenced): ${usedKeys.length}`);
console.log(`Dynamically used keys (via prefixes): ${dynamicallyUsedKeys.length}`);
console.log(`Unused keys: ${unusedKeys.length}`);

console.log('\n--- UNUSED BE KEYS ---');
unusedKeys.sort().forEach(key => {
  console.log(`  - ${key}`);
});

// Save report
fs.writeFileSync(
  path.join(__dirname, 'unused_backend_keys_report.json'),
  JSON.stringify({
    totalKeys: allKeys.size,
    usedCount: usedKeys.length,
    dynamicCount: dynamicallyUsedKeys.length,
    unusedCount: unusedKeys.length,
    usedKeys,
    dynamicallyUsedKeys,
    unusedKeys
  }, null, 2),
  'utf8'
);

console.log('\nSaved report to unused_backend_keys_report.json');
