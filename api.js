import {app, router} from "./init/serverInit.js"
import {createUser} from "./operations/dboperations.js"


router.route("/users/").post((req, resp) => {
    let userData = req.body
    createUser(
        userData.email,
         userData.password,
          userData.firstName,
           userData.lastName).then((result => resp.json(result)));
});

//testare de la amb pt voi 

var port = 8000;
app.listen(port, ()=> console.log("server is listening ..."));