const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username : {
        type : String ,
        required : [true , "username is required"] ,
        lowercase : true  ,
        unique : true ,
        minLength: [3 , "username must be contains 3 characters or more"] 
    } ,
    email : {
        type : String , 
        required : [true , "email address is required"] ,
        unique : true
    } ,
    password : {
        type : String ,
        required : true ,
        minLength: [6 , "password must be 6 characters"]   
    } ,
    role : {
        type : [String] ,
        required : [true , "role is not selected"] ,
        default : "viewer" ,
        enum : ["admin" , "workspace_admin" , "viewer"]
    }
})


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 10);
});


const userModel = mongoose.model("User" , userSchema);
module.exports = userModel