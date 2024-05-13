const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const noteSchema = new mongoose.Schema(
    {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, 
{
    timestamps: true
}
)

noteSchema.plugin(AutoIncrement, {   //create a separate collection 'counter' where it tracks every note number
    inc_field: 'ticket',
    id: 'ticketNums',   
    start_seq: 500    //starting at 500
})

module.exports = mongoose.model('Note', noteSchema)