const express = require('express');
const { translationController } = require('../controllers');
// const { authenticate } = require('../middlewares');

const router = express.Router();

// router.use(authenticate);

router.get('/', translationController.getAllTranslations);
router.get('/:lang', translationController.getTranslationsByLang);
router.put('/', translationController.updateTranslation);
router.put('/bulk', translationController.bulkUpdateTranslation);

module.exports = router;
