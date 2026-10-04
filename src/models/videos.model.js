const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
    creatorId : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "User" ,
    } ,
    video_id : {
         type : String 
    } ,
    title : {
        type : String ,
        required : true ,
    } ,
    description : {
        type : String ,
    } ,
    video_published : {
        type : String ,
        required : true
    } ,
    stats: [
    {
        views: {
            type: String,
            default: "0"
        },

        likes: {
            type: String,
            default: "0"
        },
        comments : {
            type : String ,
            default : "0"
        } ,
        caption : {
            type : String 
        } ,
        tags : [String]
    }
]
} , {timestamps : true})

// Prevent duplicate videos for the same creator
videoSchema.index(
    { creatorId: 1, video_id: 1 },
    { unique: true }
);

const videoModel = mongoose.model("Video" , videoSchema);
module.exports = videoModel
// • views, likes, comments, watchTimeMinutes, averageViewDuration
// • publishedAt, lastSyncedAt