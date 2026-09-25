require('dotenv').config()
const chalk = require('chalk')


const config = {
    PORT : process.env.PORT || 3000,
    MONGODB_URI : process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET ,
    GOOGLE_AUTH_CLIENTID : process.env.GOOGLE_AUTH_CLIENTID ,
    GOOGLE_AUTH_CLIENTSECRET : process.env.GOOGLE_AUTH_CLIENTSECRET ,
    GOOGLE_REDIRECT_URI : process.env.GOOGLE_REDIRECT_URI ,
    SESSION_SECRET : process.env.SESSION_SECRET ,
    TOKEN_ENC_KEY : process.env.TOKEN_ENC_KEY
};

if(!process.env.MONGODB_URI) {
    console.log(chalk.bold.red("Error From Config.js \n MONGODB_URI is missing"))
}
if(!process.env.JWT_SECRET) {
    console.log(chalk.bold.red("Error From Config.js \n JWT_SECRET is missing"))
}
if(!process.env.GOOGLE_AUTH_CLIENTID) {
    console.log(chalk.bold.red("Error From Config.js \n GOOGLE_AUTH_CLIENTID is missing"))
}
if(!process.env.GOOGLE_AUTH_CLIENTSECRET) {
    console.log(chalk.bold.red("Error From Config.js \n GOOGLE_AUTH_CLIENTSECRET is missing"))
}
if(!process.env.GOOGLE_REDIRECT_URI) {
    console.log(chalk.bold.red("Error From Config.js \n GOOGLE_REDIRECT_URI is missing"))
}
if(!process.env.SESSION_SECRET) {
    console.log(chalk.bold.red("Error From Config.js \n SESSION_SECRET is missing"))
}

module.exports = config;