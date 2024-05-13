const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

//@desc get all users    (description)
//@route GET /users
//@access Private
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find()               //find all users
                            .select('-password')  //but don't fetch password
                            .lean()               //limit the infos fetched to basics json
    if (!users?.length) {
        return res.status(400).json({message: 'No users found'})
    }
    res.json(users)
})

//@desc create new user
//@route POST /users
//@access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body    //deconstruct data received
    //confirm data :
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'All fields are required'})    
    }

    //check for duplicate
    const duplicate = await User.findOne({username}).collation({ locale: 'en', strength: 2}).lean().exec() 
   //mongoose say : if using async/await and passing something in, you need to call exec at the end
   if (duplicate) {
    return res.status(409).json({ message: 'Duplicate username'})
   }

   //hash password
   const hashedPwd = await bcrypt.hash(password, 10)  //password isn't stored in the DB, it's encrypted first

   const userObject = { username, "password": hashedPwd, roles}

   //create and store new user
   const user = await User.create(userObject)

   if (user) {
    res.status(201).json({ message: `New user ${username} created`})
   } else {
    res.status(400).json({ message: 'Invalid user data received'})
   }
})

//@desc updtae a user
//@route PACTH /users
//@access Private
const updateUser = asyncHandler(async (req, res) => {
    const { id, username, roles, active, password} = req.body

    //confirm data
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required'})
    }

    const user = await User.findById(id).exec()   //no lean() cause we need the save method to update

    if (!user) {
        return res.status(400).json({ message: 'User not found'})
    }

    //check for duplicate
    const duplicate	= await User.findOne({username}).collation({ locale: 'en', strength: 2}).lean().exec()
    //Allow updates to the original user
    if (duplicate && duplicate?._id.toString() !== id) {  //want to change username to an existing one
        return res.status(409).json({ message: 'Duplicate username'})
    }

    user.username = username
    user.roles = roles
    user.active = active
    if (password) {
        //hash password
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()    // if lean was passed, we wouldn't have the save method

    res.json({ message: `${updatedUser.username} updated`})
})

//@desc delete a user
//@route DELETE  /users
//@access Private
const deleteUser = asyncHandler(async (req, res) => {
    const {id} = req.body

    if (!id) {
        return res.status(400).json({ message: 'User ID required'})
    }

    const note = await Note.findOne({ user:id}).lean().exec()
 
    if (note) {
        return res.status(400).json({ message: 'User has assigned notes'})
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found'})
    }
    const result = await user.deleteOne()
    console.log(user)
    const reply = `Username ${user.username} with ID ${user._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}