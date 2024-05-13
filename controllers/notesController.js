const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')

//@desc get all notes   
//@route GET /notes
//@access Private
const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find()               //find all notes
                            .lean()               //limit the infos fetched to basics json
    if (!notes?.length) {
        return res.status(400).json({message: 'No notes found'})
    }

    //Add username
    const notesWithUsername = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return {...note, username: user.username}
    }))


    res.json(notesWithUsername)
})

//@desc create new note
//@route POST /notes
//@access Private
const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body    //deconstruct data received
    //confirm data :
    if (!user || !title || !text ) {
        return res.status(400).json({ message: 'All fields are required'})    
    }

    //check for duplicate
    const duplicate = await Note.findOne({title}).collation({ locale: 'en', strength: 2}).lean().exec() 
   //mongoose say : if using async/await and passing something in, you need to call exec at the end
   if (duplicate) {
    return res.status(409).json({ message: 'Duplicate title'})
   }
   //create and store new note
   const noteObject = { user, title, text}

   const note = await Note.create(noteObject)

   if (note) {
    res.status(201).json({ message: `New note ${title} created`})
   } else {
    res.status(400).json({ message: 'Invalid note data received'})
   }
})

//@desc update a note
//@route PACTH /notes
//@access Private
const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed} = req.body

    //confirm data
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required'})
    }

    const note = await Note.findById(id).exec()   //no lean() cause we need the save method to update

    if (!note) {
        return res.status(400).json({ message: 'Note not found'})
    }

    //check for duplicate (beware of case sensitivity => collation)
    const duplicate	= await Note.findOne({title}).collation({ locale: 'en', strength: 2}).lean().exec()
    //Allow updates to the original user
    if (duplicate && duplicate?._id.toString() !== id) {  //want to change username to an existing one
        return res.status(409).json({ message: 'Duplicate title'})
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed
   
    const updatedNote = await note.save()    // if lean was passed, we wouldn't have the save method

    res.json({ message: `${updatedNote.title} updated`})
})

//@desc delete a note
//@route DELETE  /notes
//@access Private
const deleteNote = asyncHandler(async (req, res) => {
    const {id} = req.body

    if (!id) {
        return res.status(400).json({ message: 'Note ID required'})
    }

    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found'})
    }
    const result = await note.deleteOne()

    const reply = `Note ${note.title} with ID ${note._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}