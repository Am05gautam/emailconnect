const express = require('express');
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const multer = require('multer');

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
// console.log(process.env.MONGODB_USER);

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'files');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'file/pdf' || file.mimetype === 'file/png' || file.mimetype === 'file/jpg' || file.mimetype === 'file/jpeg'){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter
}).array('file')
);

const dbUrl = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.ohrbj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(result => console.log('MongoDB Connected!'))
    .catch(err => console.log(err));

const userRouter = require('./routes/user.js');
const authRoutes = require('./routes/auth.js');

app.use("/user", userRouter);
app.use('/auth', authRoutes);

// //Handle production
// if (process.env.NODE_ENV === 'production') {
//     //Static folder
//     app.use(express.static(__dirname + '/public'));

//     // Handle SPA
//     app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));
// }

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server Running!`);
})