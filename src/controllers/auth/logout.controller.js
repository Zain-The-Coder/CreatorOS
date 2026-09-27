const logout = async (req , res) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token) {
        return res.status(404).json({
            status : 404 ,
            message : "User logout Successfully !"
        })
    };

    res.clearCookie("token")

    return res.status(200).json({
        status : 200 ,
        message : "User Logout Successfully !"
    })
}

module.exports = logout