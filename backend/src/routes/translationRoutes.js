const express = require('express');
const { translationController } = require('../controllers');
const router = express.Router();

router.get('/', translationController.getAllTranslations);
router.get('/:lang', translationController.getTranslationsByLang);
router.put('/', translationController.updateTranslation);
router.put('/bulk', translationController.bulkUpdateTranslation);

module.exports = router;
