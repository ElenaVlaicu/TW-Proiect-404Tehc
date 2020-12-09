import {app, router} from "./init/serverInit.js"
import {createUser, listUsers, addUserToTeam, createProject} from "./operations/dboperations.js"


router.route("/users").post((req, resp) => {
    let userData = req.body
    createUser(
        userData.email,
         userData.password,
          userData.firstName,
           userData.lastName).then((result => resp.json(result)));
});

router.route("/users").get((req, resp) => {
    listUsers(req.query.teamId).then((result => resp.json(result)));
});

router.route("/teams/users").post((req, resp) => {
    let body = req.body
    addUserToTeam(body.teamId, body.userId).then((result => resp.json(result)));
});

router.route("/teams/:teamId/projects").post((req, resp) => {
    let body = req.body
    createProject(body.name, body.repo, req.params.teamId, body.userIds).then((result => resp.json(result)));
});


var port = 8000;
app.listen(port, ()=> console.log("server is listening ..."));