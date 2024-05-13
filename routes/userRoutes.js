// when endpoint is 'site'/users

const express= require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT) //applied to all routes

router.route('/')    //route match 'site'/user
    .get(usersController.getAllUsers)           // 1 line for every type of CRUD response
    .post(usersController.createNewUser)
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser)

module.exports = router