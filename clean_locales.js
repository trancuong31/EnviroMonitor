const fs = require('fs');
const path = require('path');

// Helper to load JSON locale file
function loadLocaleFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
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

const reportPath = path.join(__dirname, 'unused_keys_report.json');
if (!fs.existsSync(reportPath)) {
  console.error('Error: unused_keys_report.json does not exist. Run analyze_locales.js first.');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const unusedKeys = report.unusedKeys;

if (unusedKeys.length === 0) {
  console.log('No unused keys found to clean!');
  process.exit(0);
}

const enPath = path.join(__dirname, 'frontend', 'src', 'i18n', 'locales', 'en.json');
const viPath = path.join(__dirname, 'frontend', 'src', 'i18n', 'locales', 'vi.json');
const krPath = path.join(__dirname, 'frontend', 'src', 'i18n', 'locales', 'kr.json');

console.log(`Loading en.json, vi.json, and kr.json...`);
const enObj = loadLocaleFile(enPath);
const viObj = loadLocaleFile(viPath);
const krObj = loadLocaleFile(krPath);

console.log(`Deleting ${unusedKeys.length} unused keys...`);
unusedKeys.forEach(key => {
  deleteNestedKey(enObj, key);
  deleteNestedKey(viObj, key);
  deleteNestedKey(krObj, key);
});

console.log('Pruning empty parent nodes...');
pruneEmptyObjects(enObj);
pruneEmptyObjects(viObj);
pruneEmptyObjects(krObj);

// Write to files
console.log('Writing updated en.json...');
fs.writeFileSync(enPath, JSON.stringify(enObj, null, 2) + '\n', 'utf8');

console.log('Writing updated vi.json...');
fs.writeFileSync(viPath, JSON.stringify(viObj, null, 2) + '\n', 'utf8');

console.log('Writing updated kr.json...');
fs.writeFileSync(krPath, JSON.stringify(krObj, null, 2) + '\n', 'utf8');

console.log('\nSUCCESS! Cleaned translation files saved.');
