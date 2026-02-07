/**
 * API Features class for filtering, sorting, field limiting, and pagination
 */
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
        this.whereClause = {};
        this.options = {};
    }

    /**
     * Filter results based on query parameters
     */
    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        // Handle advanced filtering (gte, gt, lte, lt)
        Object.keys(queryObj).forEach((key) => {
            if (typeof queryObj[key] === 'object') {
                const operators = { gte: '>=', gt: '>', lte: '<=', lt: '<' };
                Object.keys(queryObj[key]).forEach((op) => {
                    if (operators[op]) {
                        this.whereClause[key] = {
                            [operators[op]]: queryObj[key][op],
                        };
                    }
                });
            } else {
                this.whereClause[key] = queryObj[key];
            }
        });

        return this;
    }

    /**
     * Sort results
     */
    sort() {
        if (this.queryString.sort) {
            const sortFields = this.queryString.sort.split(',').map((field) => {
                if (field.startsWith('-')) {
                    return [field.substring(1), 'DESC'];
                }
                return [field, 'ASC'];
            });
            this.options.order = sortFields;
        } else {
            this.options.order = [['createdAt', 'DESC']];
        }

        return this;
    }

    /**
     * Limit fields returned
     */
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',');
            this.options.attributes = fields;
        }

        return this;
    }

    /**
     * Paginate results
     */
    paginate() {
        const page = parseInt(this.queryString.page, 10) || 1;
        const limit = parseInt(this.queryString.limit, 10) || 10;
        const offset = (page - 1) * limit;

        this.options.limit = limit;
        this.options.offset = offset;

        return this;
    }

    /**
     * Get the query options for Sequelize
     */
    getQueryOptions() {
        return {
            where: this.whereClause,
            ...this.options,
        };
    }
}

module.exports = { APIFeatures };
