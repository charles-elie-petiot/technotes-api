// when endpoint is 'site'/notes

const express= require('express')
const router = express.Router()
const notesController = require('../controllers/notesController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')    //route match 'site'/user
    .get(notesController.getAllNotes)           // 1 line for every type of CRUD response
    .post(notesController.createNewNote)
    .patch(notesController.updateNote)
    .delete(notesController.deleteNote)

module.exports = router