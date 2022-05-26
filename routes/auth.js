const express = require('express');
const User = require('../models/User');
const router = express.Router();
const {body , validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "RaghavSan";

//Create a User using: POST "/api/auth/createuser" doesn't require auth
router.post('/createuser',[

    body('name','Enter valid name').isLength({min:3}),
    body('email','Enter valid email address').isEmail(),
    body('password','Enter valid password').isLength({min:5})

],async (req,res)=>{
    let success = false;
    //If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success , errors: errors.array() });
    }

    // Check whether the email exists already or not
    try {
        let user = await User.findOne({email:req.body.email});
        if(user){
            return res.status(400).json({ success , error:"This email already exists"})
        }

        //securing password
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password,salt);

        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
          })
        
        //creation authentication token using JWT
        const data = {
            user : {
                id : user.id
            }
        }
        const authtoken = jwt.sign(data,JWT_SECRET);

        // res.json(user);
        res.json({success:true , authtoken});

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
})


//Authenticate a User using: POST "/api/auth/login" no login required
router.post('/login',[
    body('email','Enter valid email id').isEmail(),
    body('password','Invalid password').exists() // checking for blank password
],async (req, res) => {
    let success = false;
    //If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success , errors: errors.array() });
    }
    const {email , password} = req.body;
    try{
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({ success , errors: "Please enter correct credentials" });
        }
        const passwordCompare = await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            return res.status(400).json({ success , errors: "Please enter correct credentials" });
        }
        //creation authentication token using JWT
        const data = {
            user : {
                id : user.id
            }
        }
        const authtoken = jwt.sign(data,JWT_SECRET);
        res.json({ success:true , authtoken});
    }catch(error){
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//Getting User details using: POST "/api/auth/getuser" ; Login Required
router.post('/getuser' , fetchuser , async (req,res)=>{
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router;
