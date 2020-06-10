// Get environment variables
require('dotenv').config();

//package imports
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const formData = require('express-form-data');
const os = require('os');

//route imports
const userRoutes = require('./api/routes/user');
const animalRoutes = require('./api/routes/animal');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_KEY));

/**
 * Options are the same as multiparty takes.
 * But there is a new option "autoClean" to clean all files in "uploadDir" folder after the response.
 * By default, it is "false".
 */
const options = {
	uploadDir: os.tmpdir(),
	autoClean: true
};

// parse data with connect-multiparty. 
app.use(formData.parse(options));
// delete from the request all empty files (size == 0)
app.use(formData.format());
// change the file objects to fs.ReadStream 
app.use(formData.stream());
// union the body and the files
app.use(formData.union());

const cors_config = {
	origin: true,
	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	preflightContinue: false,
	optionsSuccessStatus: 204,
	credentials: true
};

app.use(cors(cors_config));

app.use('/api/user', userRoutes);
app.use('/api/animal', animalRoutes);

app.get('/', (req, res) => {
	return res.status(200).json({
		message: 'Hello world, now CI and CD works!'
	});
});

app.post('/', (req, res) => {
	console.log(req.body);

	return res.status(200).json({
		message: 'testing 123'
	});
});

app.use((req, res, next) => {
	const error = new Error('Not found');
	error.status = 404;
	next(error);
});

app.use((error, req, res) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message
		}
	});
});

// Connect mongoose to MongoDB database
mongoose.connect(process.env.DB_CONNECTION_STRING, { useNewUrlParser: true,  useUnifiedTopology: true  }, () => 
	console.log('Connected to DB!')
);


module.exports = app;
