const mongoose = require('mongoose');

const VbdAnimalSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	base64Image: {
		type: String,
		required: true,
		default: 'noimage'
	},
	votes: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'VbdVote'
	}]
});

module.exports = mongoose.model('VbdAnimal', VbdAnimalSchema);