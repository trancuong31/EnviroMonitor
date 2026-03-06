/**
 * Factory codes
 */
const FACTORIES = {
    D1: 'D1',
    D2: 'D2',
    V0: 'V0',
    V1: 'V1',
    V2: 'V2',
    V4: 'V4',
    V5: 'V5',
};

/**
 * Check if a factory code is valid
 */
const isValidFactory = (factory) => Object.values(FACTORIES).includes(factory);

module.exports = { FACTORIES, isValidFactory };
