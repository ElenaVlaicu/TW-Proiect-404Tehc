//configuratia initiala a serverului

import bodyParser from "body-parser";
import cors from "cors";
import express from "express";

var app = express();
var router = express.Router();

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())
app.use("/api", router);

//middleware
router.use((req, res, next) => {
    console.log("Hello from middleware");
    next();
});


export {app, router};