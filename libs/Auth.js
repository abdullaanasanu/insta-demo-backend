const User = require("../models/User");
const jwt = require('jsonwebtoken');


module.exports = {
    isLoggedIn: (req, res, next) => {
        // console.log('hhh ', header.authorization);
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'Auth Failed!' })
        }
        let token = req.headers.authorization.split(' ')[1]
        jwt.verify(token, process.env.AUTH_SECRET_KEY, async function (err, decoded) {
            if (err) {
                return res.status(401).json({ message: 'Auth Failed!' })
            }
            console.log(decoded) // bar
            req.user = await User.findById(decoded.userId, 'fullName username email');
            next()

        });
    }
}