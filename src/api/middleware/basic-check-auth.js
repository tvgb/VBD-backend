const jwt = require('jsonwebtoken');

//Used to authenticate requests using the token.
module.exports = (req, res, next) => {
	try {
		const basic_token = req.cookies.basic_token;
		const decoded = jwt.verify(basic_token, process.env.BASIC_JWT_KEY);
		req.userData = decoded;
		
		next();

	} catch (error) {
		console.log(error);

		return res.status(403).json({
			message: 'Forbidden'
		});
	}
	
};