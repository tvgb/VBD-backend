const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const Animal = require('../../models/Animal');
const VbdAnimal = require('../../models/VbdAnimal');
const VbdVote = require('../../models/VbdVote');
const fs = require('fs');
const sharp = require('sharp');


router.get('/', async (req, res) => {

	try {
		const query = VbdAnimal.find();
		query.populate({
			path: 'vbdVotes',
			populate:
				[{
					path: 'user'
				}]
		});

		const vbdAnimals = await query.exec();

		return res.json(vbdAnimals);

	} catch (error) {
		console.log(error);

		return res.status(500).send();
	}
});

router.post('/', checkAuth, async (req, res) => {

	try {
		let buffer = fs.readFileSync(req.files.image.path);
		let base64image = '';

		await sharp(buffer)
			.resize({
				width: 100,
				height: 100
			})
			.toBuffer()
			.then((data) => {
				base64image = data.toString('base64');
			});


		const vbdAnimal = new VbdAnimal({
			name: req.body.name,
			base64Image: base64image
		});

		const animal = new Animal({
			name: req.body.name,
			base64Image: base64image
		});

		const newVbdAnimal = await vbdAnimal.save();
		await animal.save();

		return res.json(newVbdAnimal).send();

	} catch (error) {
		console.log(error);

		return res.status(500).send();
	}
});

router.post('/vote', checkAuth, async (req, res) => {
	try {
		
		const vbdVote = new VbdVote({
			user: req.userData._id,
			vesenScore: req.body.vesenScore,
			overlevelsesevneScore: req.body.overlevelsesevneScore,
			xfactorScore: req.body.xfactorScore,
			ikulturenScore: req.body.ikulturenScore,
			mbvScore: req.body.mbvScore
		});

		const newVbdVote = await vbdVote.save();

		let vbdAnimal = await VbdAnimal.findById(req.body.vbdAnimalId);
		vbdAnimal.vbdVotes.push(newVbdVote._id);

		const updatedVbdAnimal = await vbdAnimal.save();

		return res.json(updatedVbdAnimal);

	} catch (error) {
		console.log(error);

		return res.status(500).send();
	}
});

module.exports = router;