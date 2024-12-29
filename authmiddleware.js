const jwt = require('jsonwebtoken');

function authenticateToken(req , res , next){
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if(!token){
		return res.status(401).json({
			error : "Please Login Again"
		})
	}

	jwt.verify(token , "MY_SECRET" , (err , user) => {
		if(err){
			return res.status(403).json({
				error : "Invalid Token"
			})
		}

		req.user = user;
		next();
	});
}

module.exports = authenticateToken;
