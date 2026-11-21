const mongoose = require('mongoose')
const {Schema} = mongoose

const taskSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    deadline:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:['todo', 'pending', 'archive', 'done'],
        default:'todo'
    },
    assignedTo:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
})

const taskModel = mongoose.model('Task', taskSchema)
module.exports = taskModel

