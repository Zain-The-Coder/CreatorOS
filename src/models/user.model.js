const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username : {
        type : String ,
        required : [function () { return !this.googleId || this.profileCompleted }, "username is required"] ,
        lowercase : true ,
        unique : true ,
        sparse : true ,
        minLength: [3 , "username must be contains 3 characters or more"]
    } ,
    email : {
        type : String ,
        required : [true , "email address is required"] ,
        lowercase : true ,
        unique : true
    } ,
    password : {
        type : String ,
        required : [function () { return !this.googleId }, "password is required"] ,
        minLength: [6 , "password must be 6 characters"]
    } ,
    role : {
        type : [String] ,
        required : [true , "role is not selected"] ,
        default : "viewer" ,
        enum : ["admin" , "workspace_admin" , "viewer"]
    } ,

    // Google / YouTube fields
    googleId : { type : String , unique : true , sparse : true } ,
    picture : String ,
    youtube : {
        channelId : String ,
        channelTitle : String ,
        subscribers : String ,
        refreshToken : { type : String , select : false }
    } ,
    profileCompleted : { type : Boolean , default : false }
} , { timestamps : true })

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

const userModel = mongoose.model("User" , userSchema);
module.exports = userModel