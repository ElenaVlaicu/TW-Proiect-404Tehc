//configuratia initiala a serverului

import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { loginByToken} from "../operations/dboperations.js"

var app = express();
var router = express.Router();

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())
app.use("/api", router);

//middleware
router.use((req, res, next) => {
    console.log(req.path)
    if(req.path !== "/login"){
        if(req.headers["authorization"]==null){
            throw Error ("invalid token")
        }
        const user = loginByToken(req.headers["authorization"])
        if(user==null){
            throw Error("Invalid token");
        }
    }

    console.log("Hello from middleware");
    next();
});


export {app, router};