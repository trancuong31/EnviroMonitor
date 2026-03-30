/**
 * Location specs
 */
const LOCATION_SPECS = {
    WHN: 'WHN',
    WHC: 'WHC',
    PL: 'PL',
    
};

/**
 * Check if a location spec is valid
 */
const isValidLocationSpec = (locationSpec) => Object.values(LOCATION_SPECS).includes(locationSpec);

module.exports = { LOCATION_SPECS, isValidLocationSpec };
