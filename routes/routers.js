const express=require("express");
require('dotenv').config();
const router=express.Router();
const User=require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth=require('../middleware/auth');
var cloudinary = require('cloudinary').v2;
cloudinary.config({
cloud_name: process.env.CLOUD_NAME,
api_key: process.env.API_KEY,
api_secret: process.env.API_SECRET
});


router.route('/getplayers').post(auth,async (req,res)=>{
  
  User.find({}).then((data)=>{
    //console.log(data);
    var players={};
    var x=0;
    data.forEach((player)=>{
     if(player.username.includes(req.body.str)){
         players[x]=player;
         x=x+1;
     }

    })
    
    //console.log(players);
    res.json(players);
}).catch((error)=>{
//console.log("err :"+error)
})
})


router.route("/updatescore").post( auth,async (req,res)=>{
  const token = req.headers.authorization.split('Bearer ')[1]
    const decoded = jwt.verify(token, "randomString");  
var userId = decoded.user.id  
    const filter = { _id:userId };
    let user= await User.findOne({
        _id:userId
}, function (err, docs) {
    if (err){
        //console.log(err)
    }
    else{
        //console.log("Result : ", docs);
    }
});
    let update=0;
    if(req.body.astroidScore!=undefined){
        update = { astroidScore: req.body.astroidScore };   
        
    if(user.astroidScore<req.body.astroidScore ){
        await User.findOneAndUpdate(filter, {$set: update},  function(err,doc) {
           if (err) { throw err; }
           else { //console.log("Updated");
           }
         });
            res.send('new datasend');
            
       }else{
           res.send('old data maintained');
       }
    }else{
      update = { snakeScore: req.body.snakeScore };
      
    if(user.snakeScore<req.body.snakeScore ){
        await User.findOneAndUpdate(filter, {$set: update},  function(err,doc) {
           if (err) { throw err; }
           else { //console.log("Updated"); 
          }
         });
            res.send('new datasend');
            
       }else{
           res.send('old data maintained');
       }
       }
//console.log(userId);
   
});

router.route("/getstopusers").get( auth,async (req,res)=>{

  
   let topscorers={};
   
  User.find({'snakeScore':{$exists: true}}).sort({'snakeScore' : '-1'}).limit(3).then((data)=>{
    topscorers=data.map((data)=>{
      //console.log(data.snakeScore);
      return [data.imgurl,data.username,data.snakeScore];
    })
  
    //console.log(topscorers);
    res.send(topscorers);
 

}).catch((error)=>{
//console.log("err :"+error)
})
     
});

router.route("/getatopusers").get( auth,async (req,res)=>{

  
   let topscorers={};
   
  User.find({'astroidScore':{$exists: true}}).sort({'astroidScore' : '-1'}).limit(3).then((data)=>{
    topscorers=data.map((data)=>{
      //console.log(data.astroidScore);
      return [data.imgurl,data.username,data.astroidScore];
    })
  
    //console.log(topscorers);
    res.send(topscorers);
 

}).catch((error)=>{
//console.log("err :"+error)
})
    

   
});


router.route("/getprofile").get( auth,async (req,res)=>{

  const token = req.headers.authorization.split('Bearer ')[1]
  const decoded = jwt.verify(token, "randomString");  
var userId = decoded.user.id  
  const filter = { _id:userId };
   
   
  User.find(filter).then((data)=>{
   
  
    // //console.log(data);
    res.send(data);
 

}).catch((error)=>{
//console.log("err :"+error)
})
     
});


router.route("/register",).post(
    async (req, res) => {
        

        const {
        email, 
        about,
        username,
        password,
        snakeScore,
        astroidScore,
        imgurl
        }=req.body
        try {
            let user = await User.findOne({
                username
            });
            let useremail = await User.findOne({
              email
          });
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (user) {
              return res.send('User Already Exists');
            }else if(useremail){
            //   return res.status(400).json({
            //     msg: "Email Already Exists"
            // });
            return res.send('Email Already Exists');
            }else if(!re.test(String(email).toLowerCase())){
              return res.send('Invalid Email');
            }


            user = new User({
                email, 
                about,
                username,
                password,
                snakeScore,
                astroidScore,
                imgurl
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();
            res.send('Hello World!');
          
        } catch (err) {
            //console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);

router.route("/updateprofile").post(auth,async (req,res)=>{
// //console.log(req.body);
  const token = req.headers.authorization.split('Bearer ')[1];
  const decoded = jwt.verify(token, "randomString");  
var userId = decoded.user.id  
  const filter = { _id:userId };
let data={};
  if(req.body.imgurl==undefined ){
     data={   
          username:req.body.username,
             about:req.body.about
          }
          //console.log('no image');
  } else {
   await cloudinary.uploader.upload(req.body.imgurl, 
    function(error, result) {
      if (error) { throw error; }
      else{
        //console.log(result.secure_url);
         data={   
          username:req.body.username,
             about:req.body.about,
             imgurl:result.secure_url
          }
      }
     
    });
    
  }
    

  //console.log(data);
  
  // //console.log(req.body.imgurl);
  // //console.log(req.body.username);
  // //console.log(req.body.about);
if(data!==null){
  await User.findOneAndUpdate(filter, {$set:data},  function(err,doc) {
    if (err) { throw err; }
    else { //console.log("Updated"+doc); 
    }
  });
     res.send('new datasend');
}

});


router.route("/login").post(
    async (req, res) => {
  
      const { email, password } = req.body;
      try {
        let user = await User.findOne({
          email
        });
        if (!user)
          return res.status(400).json({
            message: "User Not Exist"
          });
  
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return res.status(400).json({
            message: "Incorrect Password !"
          });
  
        const payload = {
          user: {
            id: user.id
          }
        };
  
        jwt.sign(
          payload,
          "randomString",
          {
            expiresIn:'1h'
          },
          (err, token) => {
            if (err) throw err;
            res.status(200).json({
              token
            });
          }
        );
      } catch (e) {
        console.error(e);
        res.status(500).json({
          message: "Server Error"
        });
      }
    }
  );
  
module.exports=router;