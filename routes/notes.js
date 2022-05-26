const express = require('express');
const {body , validationResult} = require('express-validator');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes')

//Route 1: Get all the notes using: GET "/api/notes/getuser". Login required
router.get('/fetchallnotes', fetchuser , async (req, res)=>{
    try {
        const notes = await Notes.find({user: req.user.id});
        res.json(notes);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//Route 2: add new notes using: POST "/api/notes/addnote". Login required
router.post('/addnote', fetchuser , [
    body('title','Enter a valid title').isLength({min:3}),
    body('description','Description must be alteast 5 characters').isLength({min:5})
] , async (req, res)=>{
    try {
        const { title, description, tag} = req.body;
        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        const note = new Notes({
            title,
            description,
            tag,
            user: req.user.id
        })
        const savedNote = await note.save();
        res.json(savedNote);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//Route 3: Update an existing Note using: PUT "/api/auth/updatenote/:id". Login required
router.put('/updatenote/:id', fetchuser , [
    body('title','Enter a valid title').isLength({min:3}),
    body('description','Description must be alteast 5 characters').isLength({min:5})
] , async (req, res)=>{
    try {
        const { title, description, tag} = req.body;
        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        const newNote = {};
        if(title) {newNote.title = title};
        if(description) {newNote.description = description};
        if(tag){newNote.tag = tag};
        
        //find the note to be updated and update it
        let note = await Notes.findById(req.params.id);
        if(!note){
            return res.status(404).send("Not Found");
        }
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed");
        }
        note = await Notes.findByIdAndUpdate(req.params.id , {$set: newNote}, {new:true})
        res.json({note});
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//Route 4: Delete an existing Note using: DELETE "/api/auth/deletenote/:id". Login required
router.delete('/deletenote/:id', fetchuser , async (req, res)=>{
    try {
        
        //find the note to be deleted and delete it
        let note = await Notes.findById(req.params.id);
        if(!note){
            return res.status(404).send("Not Found");
        }

        //Allow deletion only if user owns this Note
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed");
        }

        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({"Success" : "Note has been deleted", note : note})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router;