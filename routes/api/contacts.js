const express = require('express');
const { tryCatchWrapper } = require("../../helpers/index");
const { getAll, getContactById, addContact, removeContact, updateContact, updateFavoriteStatus } = require("../../controllers/contact.controller");
const { auth } = require('../../middlewares/auth');


const router = express.Router();

router.get('/', tryCatchWrapper(auth), tryCatchWrapper(getAll));
router.get('/:contactId', tryCatchWrapper(auth), tryCatchWrapper(getContactById))
router.post('/', tryCatchWrapper(auth), tryCatchWrapper(addContact));
router.delete('/:contactId', tryCatchWrapper(auth),tryCatchWrapper(removeContact))
router.put('/:contactId', tryCatchWrapper(auth), tryCatchWrapper(updateContact))
router.patch('/:contactId/favorite', tryCatchWrapper(auth), tryCatchWrapper(updateFavoriteStatus))

module.exports = router
