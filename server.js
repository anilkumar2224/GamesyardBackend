const express =require("express");
const app=express();
const cors=require("cors");
const mongoose=require("mongoose");
const morgan=require('morgan');
require('dotenv').config();

//http request logger
app.use(morgan('tiny'));

const port = process.env.PORT || 8080;

// Body-parser middleware
 app.use(express.json({limit: '50mb'}));
 app.use(express.urlencoded({limit: '50mb', extended:true}));
app.use(cors());
//connect to mongoose
mongoose.connect("mongodb+srv://Anil:anilmongodb1@cluster0.ihxib.mongodb.net/GamesYard?retryWrites=true&w=majority",{
    useNewUrlParser:true,
    useUnifiedTopology:true
});
mongoose.connection.on('connected',()=>{
    //console.log('mongoose connected!');
})




const User=require('./models/userModel');


// require route
app.use("/",require("./routes/routers"));













app.listen(port,function(){
    //console.log("express server is running ");
})