const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const Animal = require('../../models/Animal');
const VbdAnimal = require('../../models/VbdAnimal');
const VbdVote = require('../../models/VbdVote');
const Vote = require('../../models/Vote');
const fs = require('fs');
const sharp = require('sharp');

router.get('/vbd', async (req, res) => {

	try {
		const query = VbdAnimal.find();
		query.populate({
			path: 'votes',
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

router.post('/votevbd', checkAuth, async (req, res) => {
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
		vbdAnimal.votes.push(newVbdVote._id);

		const updatedVbdAnimal = await vbdAnimal.save();

		return res.json(updatedVbdAnimal);

	} catch (error) {
		console.log(error);

		return res.status(500).send();
	}
});

router.get('/folket', async (req, res) => {

	try {
		const query = Animal.find();
		query.populate({ path: 'votes' });

		const animals = await query.exec();

		return res.json(animals);

	} catch (error) {
		console.log(error);

		return res.status(500).send();
	}
});

router.post('/votefolket', async (req, res) => {
	try {

		if (req.body.vesenScore < 0 || req.body.vesenScore > 20 ||
			req.body.overlevelsesevneScore < 0 || req.body.vesenScore > 20 ||
			req.body.xfactorScore < 0 || req.body.xfactorScore > 20 ||
			req.body.ikulturenScore < 0 || req.body.ikulturenScore > 20 ||
			req.body.mbvScore < 0 || req.body.mbvScore > 20) {

			return res.status(400).send();
		}

		const query = Animal.findById(req.body.animalId);
		query.populate({ path: 'votes' });
		let animal = await query.exec();

		for (const vote of animal.votes) {
			if (vote.bfp === req.body.bfp) {
				return res.status(406).send();
			}
		}
		
		const vote = new Vote({
			bfp: req.body.bfp,
			vesenScore: req.body.vesenScore,
			overlevelsesevneScore: req.body.overlevelsesevneScore,
			xfactorScore: req.body.xfactorScore,
			ikulturenScore: req.body.ikulturenScore,
			mbvScore: req.body.mbvScore
		});

		const newVote = await vote.save();
		animal.votes.push(newVote._id);
		const updatedAnimal = await animal.save();

		return res.json(
			{
				newVote: newVote,
				animalId: updatedAnimal._id 
			} 
		);


	} catch (error) {
		console.log(error);

		return res.status(500).send();
	}
});

module.exports = router;