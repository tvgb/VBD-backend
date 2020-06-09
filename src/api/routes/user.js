const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');
const User = require('../../models/User');


// Get all users
router.get('/', checkAuth, async (req, res) =>  {
	try {
		const users = await User.find();
		return res.json(users);
	} catch (error) {
		res.json(error);
	}
});

// Get user with id
router.get('/cookieuser', checkAuth, async (req, res) => {
	const userId = req.userData._id;

	try {
		const user = await User.findById(userId);
		return res.json(
			{
				userId: user._id
			}
		);
	} catch (error) {
		res.json(error);
	}
});

/**
 * errorcode: 1 == Wrong email or password
 * errorcode: 2 == Auth failed while trying to compare hashes
 * errorcode: 3 == Something went wrong
 * errorcode: 4 == Account not verified
 */
router.post('/login', async (req, res) => {

	try {
		const email = req.body.email.toLowerCase();

		const query = User.findOne({
			email: email
		});
		
		query.select('+password');
		
		let user = await query.exec();

		// Email does not exist in database
		if (user === null) {
			return res.status(400).json({
				errorcode: 1
			});
		}

		req.body.password = `${req.body.password}`;

		// Compare password with password in database, and return signed token if equal
		await bcrypt.compare(req.body.password, user.password, async (error, result) => {

			// Something went wrong while trying to compare hashes
			if (error) {
				console.log(error);

				return res.status(401).json({
					errorcode: 2
				});
			}

			if (result) {
				const access_token = jwt.sign({
					_id: user._id
				},
				process.env.JWT_KEY,
				{
					expiresIn: '1d'
				}
				);

				// Our token expires after one day
				const oneDayToMilliseconds = 1000 * 60 * 60 * 24;

				res.cookie('access_token', access_token,
					{
						maxAge: oneDayToMilliseconds,
						httpOnly: true,
						secure: process.env.MODE === 'production' ? true : false,
						sameSite: 'lax'
					}
				);

				res.cookie('isAuthenticated', true,
					{
						maxAge: oneDayToMilliseconds,
						httpOnly: false,
						secure: process.env.MODE === 'production' ? true : false,
						sameSite: 'lax'
					}
				);

				return res.send();

			}

			// Password was incorrect
			return res.status(400).json({
				errorcode: 1
			});
		});

	} catch (error) {

		// Something went wrong while trying to get player from database
		console.log(error);

		return res.status(500).json({
			errorcode: 3
		});
	}
});

/**
 * errorcode: 1 == Wrong secret code
 * errorcode: 2 == Email already exists in database
 * errorcode: 3 == Something went wrong
 */
router.post('/signup', async (req, res) => {

	if (process.env.SECRET_CODE === req.body.secretCode) {

		await bcrypt.hash(req.body.password, 10, async (error, hash) => {

			// Something went wrong while trying to hash the password
			if (error) {
				console.log(error);

				return res.status(500).json({
					errorcode: 3
				});
			}

			const newUser = new User({
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				email: req.body.email,
				password: hash,
				admin: true
			});

			const newSavedUser = await newUser.save();

			return res.status(200).json(newSavedUser);
		});

	} else {
		// Wrong secret code
		return res.status(418).json({
			errorcode: 1
		});
	}
});

router.put('/changePassword', checkAuth, async (req, res) => {

	try {
		const query = User.findById(req.userData._id);
		query.select('+password');
		let user = await query.exec();
	
		if (user === null) {
			return res.status(401).send();
		}
		
		req.body.oldPassword = `${req.body.oldPassword}`;

		// Compare password with password in database, and return signed token if equal
		await bcrypt.compare(req.body.oldPassword, user.password, async (error, result) => {

			// Something went wrong while trying to compare hashes
			if (error) {
				return res.status(500).send();
			}

			if (result) {
				await bcrypt.hash(req.body.newPassword, 10, async (error, hash) => {

					// Something went wrong while trying to hash the password
					if (error) {
						return res.status(500);
					}
		
					user.password = hash;
					await user.save();

					return res.status(200).send();
				});
			} else {
				// Password was incorrect
				return res.status(400).json({
					errorcode: 1
				});
			}

			
		});
	} catch (error) {
		
		console.log(error);

		return res.status(500).send();
	}
});

module.exports = router;