
const mongoose=require("mongoose");
const userSchema= mongoose.Schema({
    email:{
        type:String,
        required:true

    },
    about:{
        type:String,
        
    },
    username:{
        type:String,
        required:true,
        
    },
    password:{
        type:String,
        required:true,
        
    },
    imgurl:{
        type:String
    },
    snakeScore:Number,
    astroidScore:Number
    
    

})
const  User=mongoose.model("User",userSchema);
module.exports=User;