/**
 * Warning threshold checking utilities
 * Centralized functions for temperature and humidity warning logic
 */

/**
 * Check if temperature is outside safe range
 * @param {number} temperature 
 * @param {{ tempMin: number, tempMax: number }} thresholds 
 * @returns {boolean}
 */
export const isTemperatureWarning = (temperature, thresholds) => {
    return temperature < thresholds.tempMin || temperature > thresholds.tempMax;
};

/**
 * Check if humidity is outside safe range
 * @param {number} humidity 
 * @param {{ humMin: number, humMax: number }} thresholds 
 * @returns {boolean}
 */
export const isHumidityWarning = (humidity, thresholds) => {
    return humidity < thresholds.humMin || humidity > thresholds.humMax;
};

/**
 * Check if location values are in warning range
 * @param {number} temperature 
 * @param {number} humidity 
 * @param {{ tempMin: number, tempMax: number, humMin: number, humMax: number }} thresholds 
 * @returns {boolean}
 */
export const isWarning = (temperature, humidity, thresholds) => {
    return isTemperatureWarning(temperature, thresholds) || isHumidityWarning(humidity, thresholds);
};

/**
 * Get warning status text with specific warnings
 * @param {number} temperature 
 * @param {number} humidity 
 * @param {{ tempMin: number, tempMax: number, humMin: number, humMax: number }} thresholds 
 * @param {Function} t - i18n translation function
 * @returns {string|null}
 */
export const getWarningStatus = (temperature, humidity, thresholds, t) => {
    const warnings = [];

    if (temperature < thresholds.tempMin) {
        warnings.push(t('dashboard.tempLow', 'Nhiệt độ thấp'));
    }
    if (temperature > thresholds.tempMax) {
        warnings.push(t('dashboard.tempHigh', 'Nhiệt độ cao'));
    }
    if (humidity < thresholds.humMin) {
        warnings.push(t('dashboard.humLow', 'Độ ẩm thấp'));
    }
    if (humidity > thresholds.humMax) {
        warnings.push(t('dashboard.humHigh', 'Độ ẩm cao'));
    }

    return warnings.length > 0 ? warnings.join(' • ') : null;
};
