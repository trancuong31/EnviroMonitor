const { Translation } = require('../models');
const { sequelize } = require('../config/database');

const getAllTranslations = async () => {
    const translations = await sequelize.query(`
        SELECT * FROM translations ORDER BY VI
    `, { type: sequelize.QueryTypes.SELECT });
    return translations;
};

const getTranslationsByLang = async (lang) => {
    const translations = await sequelize.query(`
        SELECT ID, DESCRIPTION, ${lang} FROM translations ORDER BY DESCRIPTION
    `, { type: sequelize.QueryTypes.SELECT });
    return translations;
};

const updateTranslation = async ({ description, vi, en, kr, eventUser }) => {
    const translation = await Translation.findOne({ where: { description } });
    if (!translation) {
        return null;
    }
    const updateData = {};
    if (vi !== undefined) updateData.vi = vi;
    if (en !== undefined) updateData.en = en;
    if (kr !== undefined) updateData.kr = kr;
    if (eventUser !== undefined) updateData.eventUser = eventUser;
    await translation.update(updateData);
    return translation;
};

const bulkUpdateTranslationList = async ({ translations, eventUser }) => {
    const bulk = await sequelize.transaction(async (t) => {
        const results = [];
        for (const { description, vi, en, kr } of translations) {
            const record = await Translation.findOne({ where: { description }, transaction: t });
            if (!record) {
                continue;
            }
            const updateData = {};
            if (vi !== undefined) updateData.vi = vi;
            if (en !== undefined) updateData.en = en;
            if (kr !== undefined) updateData.kr = kr;
            if (eventUser !== undefined) updateData.eventUser = eventUser;
            await record.update(updateData, { transaction: t });
            results.push(record);
        }
        return results;
    });
    return bulk;
};

module.exports = {
    getAllTranslations,
    getTranslationsByLang,
    updateTranslation,
    bulkUpdateTranslationList
};