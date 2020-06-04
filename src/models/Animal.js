const mongoose = require('mongoose');

const AnimalSchema = mongoose.Schema({
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
		ref: 'Vote'
	}]
});

module.exports = mongoose.model('Animal', AnimalSchema);