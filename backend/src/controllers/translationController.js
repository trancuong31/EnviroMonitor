const translations = require('../services/translationService');
const { catchAsync } = require('../utils/catchAsync');
const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * get all translations
 */
const getAllTranslations = catchAsync(async (req, res) => {
    const allTranslations = await translations.getAllTranslations();

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { allTranslations },
    });
});

/**
 * get list translations by lang
 */

const getTranslationsByLang = catchAsync(async (req, res) => {
    const { lang } = req.params;
    if (lang !== 'vi' && lang !== 'en' && lang !== 'kr') {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
            status: 'fail',
            message: 'Invalid language',
        });
    }

    const listTranslations = await translations.getTranslationsByLang(lang);
    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { listTranslations },
    });
});

/**
 * Update translation
 */
const updateTranslation = catchAsync(async (req, res) => {
    const {description, vi, en, kr, eventUser } = req.body;
    const translation = await translations.updateTranslation({description, vi, en, kr, eventUser });

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { translation },
    });
});

/**
 * Bulk update translation
 */
const bulkUpdateTranslation = catchAsync(async (req, res) => {
    const { translations: translationList, eventUser } = req.body;
    const translation = await translations.bulkUpdateTranslationList({ translations: translationList, eventUser });

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { translation },
    });
});

module.exports = {
    getAllTranslations,
    getTranslationsByLang,
    updateTranslation,
    bulkUpdateTranslation
};