/**
 * Formats a raw sensor ID (like V4_3F_PL_N_02 or PL_N_01) into a human-readable, translated string.
 * @param {string} locationName - The raw sensor ID
 * @param {function} t - The i18n translation function
 * @returns {string} - The formatted string (e.g. "Product_line 01")
 */
export const formatSensorName = (locationName, t) => {
    if (!locationName) return 'Unknown';

    const parts = locationName.split('_');
    if (parts.length >= 2) {
        // Find the index for the location type (PL, WH, OF, etc.)
        // Usually, if the name includes factory & floor (e.g., V0_3F_WH_N_01), it has >= 4 parts
        // and the type is at index 2. If it's already stripped (WH_N_01), it's at index 0.
        let typeIndex = 0;

        // If first part looks like a Factory (e.g. starts with V and followed by a number like V1, V4, V10, V0)
        // or just generically if there are many parts, assume format FACTORY_FLOOR_TYPE_...
        if (parts.length >= 4 && (parts[0].startsWith('V') || parts[0].startsWith('D'))) {
            typeIndex = 2;
        }

        const prefix = parts[typeIndex];
        const number = parts[parts.length - 1];

        const translatedPrefix = t(`sensor.loc_${prefix}`, { defaultValue: prefix });

        return `${translatedPrefix} ${number}`;
    }

    return locationName;
};
