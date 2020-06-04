const mongoose = require('mongoose');

const VbdVoteSchema = mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	vesenScore: {
		type: Number,
		validate: {
			validator: Number.isInteger,
			message: '{Value} is not an integer'
		},
		default: 0
	},
	overlevelsesevneScore: {
		type: Number,
		validate: {
			validator: Number.isInteger,
			message: '{Value} is not an integer'
		},
		default: 0
	},
	xfactorScore: {
		type: Number,
		validate: {
			validator: Number.isInteger,
			message: '{Value} is not an integer'
		},
		default: 0
	},
	ikulturenScore: {
		type: Number,
		validate: {
			validator: Number.isInteger,
			message: '{Value} is not an integer'
		},
		default: 0
	},
	mbvScore: {
		type: Number,
		validate: {
			validator: Number.isInteger,
			message: '{Value} is not an integer'
		},
		default: 0
	}
});

module.exports = mongoose.model('VbdVote', VbdVoteSchema);