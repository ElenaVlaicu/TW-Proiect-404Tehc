import {app, router} from "./init/serverInit.js"
import {createUser, listUsers, addUserToTeam, createProject, addUserToProject, addUserAsTester} from "./operations/dboperations.js"


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


router.route("/users/:userId/projects/:projectId").post((req, resp) => {
    addUserToProject(req.params.projectId, req.params.userId).then((result => resp.json(result))).catch(err => {
        console.log(err)
    })
});

router.route("/project/:projectId/users/:userId").post((req, resp) => {
    addUserAsTester(req.params.projectId, req.params.userId).then((result => resp.json(result))).catch(err => {
        console.log(err)
    })
});









var port = 8000;
app.listen(port, ()=> console.log("server is listening ..."));