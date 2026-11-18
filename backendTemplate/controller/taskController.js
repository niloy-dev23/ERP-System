const taskModel = require('../models/taskModel')

const createTask = async (req, res) =>{
    const {title, description, deadline, status} = req.body
    try{
        const task = await taskModel.create({
            title, description, deadline, status
        })
        if(!title || !description || !deadline || !status){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        if(title.length > 30){
            return res.status(400).json({
                success:false,
                message:"Title must be less than 30 characters"
            })
        }
        if(description.length > 500){
            return res.status(400).json({
                success:false,
                message:"Description must be less than 500 characters"
            })
        }
        if(deadline < new Date()){
            return res.status(400).json({
                success:false,
                message:"Deadline must be a future date"
            })
        }
        res.status(201).json({
            success:true,
            message:"Task Created Successfully",
            data:task
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Task Creation Failed",
            errorMsg:err
        })
    }
}

const updateTask = async (req, res) =>{
    const {id} = req.params
    const {title, description, deadline, status} = req.body
    try{
        const task = await taskModel.findByIdAndUpdate(id, {
            title, description, deadline, status
        }, {new:true})
        if(!task){
            return res.status(404).json({
                success:false,
                message:"Task Not Found"
            })
        }
        res.status(200).json({
            success:true,
            message:"Task Updated Successfully",
            data:task
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Task Update Failed",
            errorMsg:err
        })
    }
}


const deleteTask = async (req, res) =>{
    const {id} = req.params
    try{
        const task = await taskModel.findByIdAndDelete(id)
        if(!task){
            return res.status(404).json({
                success:false,
                message:"Task Not Found"
            })
        }
        res.status(200).json({
            success:true,
            message:"Task Deleted Successfully",
            data:task
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Task Deletion Failed",
            errorMsg:err
        })
    }   
}        

const getAllTasks = async (req, res) =>{
    try{
        const tasks = await taskModel.find()
        res.status(200).json({
            success:true,
            message:"Tasks Retrieved Successfully",
            data:tasks
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Tasks Retrieval Failed",
            errorMsg:err
        })
    }
}    

const getSingleTask = async (req, res) =>{
    const {id} = req.params
    try{
        const task = await taskModel.findById(id)
        if(!task){
            return res.status(404).json({
                success:false,
                message:"Task Not Found"
            })
        }
        res.status(200).json({
            success:true,
            message:"Task Retrieved Successfully",
            data:task
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Task Retrieval Failed",
            errorMsg:err
        })

    }
}

module.exports = {
    createTask,
    updateTask,
    deleteTask,
    getAllTasks,
    getSingleTask
}
