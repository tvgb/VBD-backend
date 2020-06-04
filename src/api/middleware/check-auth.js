const jwt = require('jsonwebtoken');

//Used to authenticate requests using the token.
module.exports = (req, res, next) => {
    try {
        const access_token = req.cookies.access_token;
        const decoded = jwt.verify(access_token, process.env.JWT_KEY);
        req.userData = decoded;

        next();

    } catch (error) {
        console.log(error);

        return res.status(401).json({
            message: 'Auth failed'
        });
    }
    
};