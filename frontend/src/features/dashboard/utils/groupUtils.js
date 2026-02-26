/**
 * Group locations by the first N characters of `location` (tc_name).
 * Preserves the original order of items within each group.
 *
 * @param {Array} locations - filtered/sorted location array
 * @param {number} prefixLength - number of leading chars to use as group key
 * @returns {Array<{ prefix: string, items: Array }>} grouped locations
 */
export const groupByLocationPrefix = (locations, prefixLength = 5) => {
    const groupMap = new Map();

    for (const loc of locations) {
        const prefix = loc.location.substring(0, prefixLength);

        if (!groupMap.has(prefix)) {
            groupMap.set(prefix, []);
        }
        groupMap.get(prefix).push(loc);
    }

    return Array.from(groupMap, ([prefix, items]) => ({ prefix, items }));
};
