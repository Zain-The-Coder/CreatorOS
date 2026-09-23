const mongoose = require('mongoose')
const config = require('../config/config.js')
const chalk = require('chalk')


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(config.MONGODB_URI)
        console.log(chalk.chalkStderr.bold.green(`MongoDB Connected Successfully . \n DB Host : ${connectionInstance.connection.host}`))
    } catch (e) {
        console.log(chalk.chalkStderr.bold.red(`MongoDB Not Connected Due To : ${e.message}`))
        process.exit(1)
    }
}

module.exports = connectDB



