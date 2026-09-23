const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
    creatorId : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "CreatorProfile" ,
        required : true ,
    } ,
    title : {
        type : String ,
        required : true ,
    } ,
    description : {
        type : String ,
    } ,
    thumbnailUrl : {
        type : String ,
        required : true
    } ,
    niche : {
        type : String ,
        required : true
    } , 
    video_Stats: [
    {
        views: {
            type: Number,
            default: 0
        },

        likes: {
            type: Number,
            default: 0
        },

        watchTimeMinutes :{
            type: Number,
            default: 0
        } ,

    }
]
} , {timestamps : true})

export const videoModel = mongoose.model("Video" , videoSchema)

// • views, likes, comments, watchTimeMinutes, averageViewDuration
// • publishedAt, lastSyncedAt