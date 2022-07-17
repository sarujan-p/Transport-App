const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const router = require("./routes/users");

const app = express();
const port = 8000;
const dburl = "mongodb://localhost:27017/sarujan";

app.use(bodyParser.json({limit: "20mb", extended: true}));
app.use(bodyParser.urlencoded({limit: "20mb", extended: true}));
app.use(cookieParser());
app.use(cors({credentials: true, origin: "http://localhost:3000"}));
app.use("/", router);

app.listen(port , () => {
    console.log(`server run on port ${port}`);
});

mongoose.connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log(`Database connected on url ${dburl}`);
}).catch((err) => console.log(err.message));

