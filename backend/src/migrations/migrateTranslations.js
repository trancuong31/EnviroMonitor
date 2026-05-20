/**
 * @file migrateTranslations.js
 * @description Migration script to synchronize translation keys from Frontend and Backend locales into the database.
 * @rules Follows standard CommonJS structure, clean separation of concerns, and robust error handling.
 */

// Load environment variables first
require('../config/env');

const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

/**
 * 1. Flattens a nested object into a single-level object with dot-notation keys.
 * @param {Object} obj - The object to flatten.
 * @param {String} prefix - Accumulator prefix for recursion.
 * @returns {Object} Flattened object.
 */
const flattenObject = (obj, prefix = '') => {
    const acc = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(acc, flattenObject(value, newKey));
            } else {
                acc[newKey] = value;
            }
        }
    }
    return acc;
};

/**
 * 2. Safely loads frontend translation JSON files.
 * @param {String} filePath - Path to the JSON file.
 * @returns {Object} Parsed translation object or empty object.
 */
const loadFrontendLocale = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        logger.warn(`⚠️ Frontend locale file not found: ${filePath}`);
        return {};
    } catch (error) {
        logger.error(`❌ Error parsing frontend locale at ${filePath}:`, error.message);
        return {};
    }
};

/**
 * 3. Safely loads backend translation JS files if they exist.
 * @param {String} lang - Language code ('en', 'vi', 'kr').
 * @returns {Object} Loaded translation object or empty object.
 */
const loadBackendLocale = (lang) => {
    // Check both potential backend locales directories
    const paths = [
        path.join(__dirname, `../locales/${lang}.js`),
        path.join(__dirname, `../../locales/${lang}.js`)
    ];

    let filePath = null;
    for (const p of paths) {
        if (fs.existsSync(p)) {
            filePath = p;
            break;
        }
    }

    if (!filePath) {
        return {};
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Convert ES Module exports to CommonJS if present
        let cjsContent = content.replace(new RegExp(`export\\s+const\\s+(${lang}|ko)\\s*=`), 'const localeData =');
        cjsContent += '\nmodule.exports = localeData;';

        const tempPath = path.join(__dirname, `temp_migrate_${lang}.js`);
        fs.writeFileSync(tempPath, cjsContent, 'utf8');

        const obj = require(tempPath);
        
        // Clean up temp file
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
        delete require.cache[require.resolve(tempPath)];
        
        return obj;
    } catch (error) {
        logger.warn(`⚠️ Failed to load backend locale file for '${lang}' at ${filePath}:`, error.message);
        return {};
    }
};

/**
 * 4. Generates the next logical ID in Lxxxxx format (e.g. L00001).
 * @param {String|null} currentMaxId - The current maximum ID.
 * @param {Number} index - Incremental counter for bulk inserts.
 * @returns {String} Generated ID in Lxxxxx format.
 */
const generateNextId = (currentMaxId, index) => {
    let lastNum = 0;
    if (currentMaxId && typeof currentMaxId === 'string' && currentMaxId.length > 1) {
        const numPart = currentMaxId.substring(1);
        if (!isNaN(numPart)) {
            lastNum = parseInt(numPart, 10);
        }
    }
    const nextNum = lastNum + index + 1;
    return `L${nextNum.toString().padStart(5, '0')}`;
};

/**
 * 5. Initializes the required database tables if missing.
 */
const initializeDatabase = async () => {
    try {
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS translations (
                id VARCHAR(10) PRIMARY KEY,
                description VARCHAR(255) NOT NULL UNIQUE,
                vi TEXT,
                en TEXT,
                kr TEXT,
                eventuser VARCHAR(100),
                eventtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        logger.info("✅ Database schema translations ensured.");
    } catch (error) {
        logger.error("❌ Failed to initialize database schema:", error.message);
        throw error;
    }
};

/**
 * 6. Main migration execution function.
 */
const migrate = async () => {
    let hasError = false;
    try {
        logger.info("⏳ Starting multi-language synchronization (Migration)...");

        // Authenticate connection
        await sequelize.authenticate();
        logger.info("✅ Connected to MariaDB successfully.");

        // Ensure database table is set up
        await initializeDatabase();

        // Load Frontend Locales (Relative path from backend/src/migrations)
        const enFEPath = path.join(__dirname, '../../../frontend/src/i18n/locales/en.json');
        const viFEPath = path.join(__dirname, '../../../frontend/src/i18n/locales/vi.json');
        const krFEPath = path.join(__dirname, '../../../frontend/src/i18n/locales/kr.json');

        const enFE = loadFrontendLocale(enFEPath);
        const viFE = loadFrontendLocale(viFEPath);
        const krFE = loadFrontendLocale(krFEPath);

        // Load Backend Locales (if they exist)
        const enBE = loadBackendLocale('en');
        const viBE = loadBackendLocale('vi');
        const krBE = loadBackendLocale('kr');

        // Flatten structures
        const finalVi = { ...flattenObject(viFE), ...flattenObject(viBE) };
        const finalEn = { ...flattenObject(enFE), ...flattenObject(enBE) };
        const finalKr = { ...flattenObject(krFE), ...flattenObject(krBE) };

        // Consolidate all translation keys
        const allKeys = Array.from(new Set([
            ...Object.keys(finalVi),
            ...Object.keys(finalEn),
            ...Object.keys(finalKr),
        ]));

        logger.info(`🚀 Found ${allKeys.length} translation keys to synchronize.`);

        // Fetch the current max ID in the translations table
        const rows = await sequelize.query(
            "SELECT id FROM translations WHERE id LIKE 'L%' ORDER BY id DESC LIMIT 1",
            { type: sequelize.QueryTypes.SELECT }
        );
        const currentMaxId = rows.length > 0 ? rows[0].id : null;

        let insertedCount = 0;
        let updatedCount = 0;

        // Perform transactional update/insert for consistency
        for (let i = 0; i < allKeys.length; i++) {
            const keyName = allKeys[i];
            const contentVi = finalVi[keyName] || null;
            const contentEn = finalEn[keyName] || null;
            const contentKr = finalKr[keyName] || null;

            // Check if key already exists in DB
            const existing = await sequelize.query(
                "SELECT id FROM translations WHERE description = :description",
                {
                    replacements: { description: keyName },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            if (existing.length > 0) {
                // Update existing record
                await sequelize.query(
                    "UPDATE translations SET vi = :vi, en = :en, kr = :kr, eventuser = 'IT' WHERE description = :description",
                    {
                        replacements: {
                            vi: contentVi,
                            en: contentEn,
                            kr: contentKr,
                            description: keyName
                        }
                    }
                );
                updatedCount++;
            } else {
                // Insert new record
                const nextId = generateNextId(currentMaxId, insertedCount);
                await sequelize.query(
                    "INSERT INTO translations (id, vi, en, kr, description, eventuser) VALUES (:id, :vi, :en, :kr, :description, 'IT')",
                    {
                        replacements: {
                            id: nextId,
                            vi: contentVi,
                            en: contentEn,
                            kr: contentKr,
                            description: keyName
                        }
                    }
                );
                insertedCount++;
            }
        }

        logger.info(`✅ Multi-language migration completed successfully!`);
        logger.info(`📊 Summary Report: Created: ${insertedCount} | Updated: ${updatedCount}`);

    } catch (error) {
        logger.error("❌ Critical error during migration:", error.message || error);
        hasError = true;
    } finally {
        // Safe database disconnection
        if (sequelize && typeof sequelize.close === 'function') {
            await sequelize.close();
            logger.info("🔌 Database connection closed.");
        }
        process.exit(hasError ? 1 : 0);
    }
};

// Execute Migration
migrate();