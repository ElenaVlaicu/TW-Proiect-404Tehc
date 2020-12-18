import {app, router} from "./init/serverInit.js"
import {createUser, listUsers, addUserToTeam, createProject, addUserToProject, addUserAsTester, addBugToProject, assignBugToUser, setBugIsFixed} from "./operations/dboperations.js"
import { Project, Team, TeamUser } from "./sequelize/sequelize.js";

//creaza un user
router.route("/users").post((req, resp) => {
    let userData = req.body
    createUser(
        userData.email,
         userData.password,
          userData.firstName,
           userData.lastName).then((result => resp.json(result)));
});

//afiseaza toti userii unei echipe
router.route("/users").get((req, resp) => {
    listUsers(req.query.teamId, req.query.projectId).then((result => resp.json(result)));
});

//se adauga un user intr-o echipa
router.route("/teams/users").post((req, resp) => {
    let body = req.body
    addUserToTeam(body.teamId, body.userId).then((result => resp.json(result)));
});

//se creaza un proiect pentru o echipa (cu id-ul specificat)
router.route("/teams/:teamId/projects").post((req, resp) => {
    let body = req.body
    createProject(body.name, body.repo, req.params.teamId, body.userIds).then((result => resp.json(result)));
});

//se adauga un user la un proiect
router.route("/users/:userId/projects/:projectId").post((req, resp) => {
    addUserToProject(req.params.projectId, req.params.userId).then((result => resp.json(result))).catch(err => {
        console.log(err)
    })
});

//un utilizator este inregistrat ca tester
router.route("/project/:projectId/users/:userId").post((req, resp) => {
    addUserAsTester(req.params.projectId, req.params.userId).then((result => resp.json(result))).catch(err => {
        console.log(err)
    })
});

//se adauga un bug la un proiect (DOAR de catre testeri)
router.route("/projects/:projectId/bugs").post((req,resp)=>{
    let body=req.body
    addBugToProject(body.severity,body.priority,body.description,req.params.projectId).then((result=>resp.json(result))).catch(err =>
        {
            console.log(err)
        })
});

//un user (DOAR membru al unei echipe) isi asigneaza un bug
router.route("/bugs/:bugId/users/:userId").put((req,resp)=>{
    assignBugToUser(req.params.userId,req.params.bugId).then((result)=>resp.json(result)).catch(err =>{
        console.log(err)
    })
});

//se updateaza starea bug-ului, care devine acum rezolvat
router.route("/bugs/:bugId/resolve").put((req, res)=>{
    setBugIsFixed(req.params.bugId, req.body.commit).then((result)=>res.json(result)).catch(err =>{
        console.log(err)
    })
});

router.route("/project/:projectId").delete((req,res)=>{
    Project.findByPk(req.params.projectId).then(record => {
        record.destroy();
    }).then(() => res.json(`The project with the id ${req.params.projectId} was deleted successfully.`))
    .catch(err => {console.log(err)})
});

router.route("/users/:userId/teams/:teamId").delete((req,res)=>{
    TeamUser.destroy({where: {
        teamId: req.params.teamId,
        userId: req.params.userId
    }}).then(() => res.json(`The user from the team with id ${req.params.teamId} was deleted successfully.`))
    .catch(err => {console.log(err)})
})


var port = 8000;
app.listen(port, ()=> console.log("server is listening ..."));