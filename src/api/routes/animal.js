const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const Animal = require('../../models/Animal');
const Vote = require('../../models/Vote');

router.get('/', async (req, res) => {

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

router.post('/vote', async (req, res) => {
	try {

        if (req.body.vesenScore < 0 || req.body.vesenScore > 20 ||
            req.body.overlevelsesevneScore < 0 || req.body.vesenScore > 20 ||
            req.body.xfactorScore < 0 || req.body.xfactorScore > 20 ||
            req.body.ikulturenScore < 0 || req.body.ikulturenScore > 20 ||
            req.body.mbvScore < 0 || req.body.mbvScore > 20) {

            return res.status(400).send();
        }

		const vote = new Vote({
			vesenScore: req.body.vesenScore,
			overlevelsesevneScore: req.body.overlevelsesevneScore,
			xfactorScore: req.body.xfactorScore,
			ikulturenScore: req.body.ikulturenScore,
			mbvScore: req.body.mbvScore
		});

		const newVote = await vote.save();

		let animal = await Animal.findById(req.body.animalId);
		console.log(animal);
		animal.votes.push(newVote._id);

		const updatedAnimal = await animal.save();

		return res.json(updatedAnimal);


	} catch (error) {
		console.log(error);

		return res.status(500).send();
	}
});

module.exports = router;