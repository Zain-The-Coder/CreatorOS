const Redis = require('ioredis')
const config = require('../config/config.js')

const redis = new Redis(config.REDIS_URL)

redis.on('connect' , () => {
    console.log("redis connected")
})

redis.on('error' , (err) => {
    console.log(err.message)
})

module.exports= redis ;