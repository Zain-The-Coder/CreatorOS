const app = require('./src/app.js')
const connectDB = require('./src/db/db.js')

connectDB()
app.listen(3000 , (req , res) => {
    console.log("Server is running on port 3000")
})