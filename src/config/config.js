require('dotenv').config()
const chalk = require('chalk')


const config = {
    PORT : process.env.PORT || 3000,
    MONGODB_URI : process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET
};

if(!process.env.MONGODB_URI) {
    console.log(chalk.bold.red("Error From Config.js \n MONGODB_URI is missing"))
}
if(!process.env.JWT_SECRET) {
    console.log(chalk.bold.red("Error From Config.js \n JWT_SECRET is missing"))
}

module.exports = config;