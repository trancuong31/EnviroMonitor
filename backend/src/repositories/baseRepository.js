/**
 * Base repository with common CRUD operations
 */
class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    /**
     * Find all records with optional filters
     */
    async findAll(options = {}) {
        return this.model.findAll(options);
    }

    /**
     * Find one record by id
     */
    async findById(id, options = {}) {
        return this.model.findByPk(id, options);
    }

    /**
     * Find one record by conditions
     */
    async findOne(options = {}) {
        return this.model.findOne(options);
    }

    /**
     * Create a new record
     */
    async create(data) {
        return this.model.create(data);
    }

    /**
     * Update a record by id
     */
    async update(id, data) {
        const record = await this.findById(id);
        if (!record) return null;
        return record.update(data);
    }

    /**
     * Delete a record by id
     */
    async delete(id) {
        const record = await this.findById(id);
        if (!record) return false;
        await record.destroy();
        return true;
    }

    /**
     * Count records with optional filters
     */
    async count(options = {}) {
        return this.model.count(options);
    }

    /**
     * Find and count all with pagination
     */
    async findAndCountAll(options = {}) {
        return this.model.findAndCountAll(options);
    }
}

module.exports = { BaseRepository };
