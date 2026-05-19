const fs = require('fs');
const path = require('path');

// Helper to load ES locale file as standard object
function loadLocaleFile(filePath, varName) {
  const content = fs.readFileSync(filePath, 'utf8');
  let cjsContent = content.replace(new RegExp(`export\\s+const\\s+${varName}\\s*=`), `const ${varName} =`);
  cjsContent += `\nmodule.exports = ${varName};`;
  
  const tempPath = path.join(__dirname, `temp_scan_${varName}.js`);
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

// Recurse directory and get all HTML/JS files
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      if (file !== 'locales' && file !== 'node_modules' && file !== 'assets') { // Exclude locales and libraries
        getFiles(name, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (['.html', '.js'].includes(ext)) {
        fileList.push(name);
      }
    }
  }
  return fileList;
}

const enPath = path.join(__dirname, 'frontend', 'src', 'i18n', 'locales', 'en.json');
const viPath = path.join(__dirname, 'frontend', 'src', 'i18n', 'locales', 'vi.json');
const krPath = path.join(__dirname, 'frontend', 'src', 'i18n', 'locales', 'kr.json');

const enObj = loadLocaleFile(enPath, 'en');
const viObj = loadLocaleFile(viPath, 'vi');
const krObj = loadLocaleFile(krPath, 'kr');

const enFlat = flattenKeys(enObj);
const viFlat = flattenKeys(viObj);
const krFlat = flattenKeys(krObj);

const allKeys = new Set([...Object.keys(enFlat), ...Object.keys(viFlat), ...Object.keys(krFlat)]);
const frontendDir = path.join(__dirname, 'frontend');
const files = getFiles(frontendDir);

// Also include assets/js/nav.js
const navJsPath = path.join(frontendDir, 'assets', 'js', 'nav.js');
if (fs.existsSync(navJsPath)) {
  files.push(navJsPath);
}

console.log(`Scanning ${files.length} Frontend files for translation keys...`);

// Preload all file contents
const fileContents = files.map(file => ({
  path: file,
  relPath: path.relative(frontendDir, file),
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
  
  // Check for dynamic prefix match (e.g. `'prefix.'` or `"prefix."`)
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
        if (fc.path.endsWith('.js')) {
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

console.log('\n--- FRONTEND ANALYSIS REPORT ---');
console.log(`Total Keys: ${allKeys.size}`);
console.log(`Used keys (exactly referenced): ${usedKeys.length}`);
console.log(`Dynamically used keys (via prefixes): ${dynamicallyUsedKeys.length}`);
console.log(`Unused keys: ${unusedKeys.length}`);

console.log('\n--- UNUSED KEYS ---');
unusedKeys.sort().forEach(key => {
  console.log(`  - ${key}`);
});

// Save report
fs.writeFileSync(
  path.join(__dirname, 'unused_keys_report.json'),
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

console.log('\nSaved report to unused_keys_report.json');
