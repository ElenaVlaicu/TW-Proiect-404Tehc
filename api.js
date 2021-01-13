import { app, router } from "./init/serverInit.js"
import { login, loginByToken, listProjects, listTeams, createUser, listUsers, addUserToTeam, createProject, addUserToProject, addUserAsTester, addBugToProject, assignBugToUser, setBugIsFixed, listBugs } from "./operations/dboperations.js"
import { Project, Team, TeamUser } from "./sequelize/sequelize.js";

//creaza un user
router.route("/users").post((req, resp) => {
    let userData = req.body
    createUser(
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName)
        .then((result => resp.json(result)))
        .catch((err) => { resp.status(400).json({ message: err.message }) });
});

//afiseaza toti userii unei echipe
router.route("/users").get((req, resp) => {
    listUsers(req.query.teamId, req.query.projectId).then((result => resp.json(result)));
});

router.route("/projects").get((req, res)=>{
    listProjects(req.query.teamId)
        .then((result => res.json(result)))
        .catch((err) => { res.status(400).json({ message: err.message }) });
});

router.route("/teams").get((req, resp)=>{
    listTeams().then((result => resp.json(result)));
});

//se adauga un user intr-o echipa
router.route("/teams/users").post((req, resp) => {
    let body = req.body
    addUserToTeam(body.teamId, body.userId)
        .then((result => resp.json({ message: 'User added to team' })))
        .catch((err) => { resp.status(400).json({ message: err.message }) });
});

//se creaza un proiect pentru o echipa (cu id-ul specificat)
router.route("/teams/:teamId/projects").post((req, resp) => {
    let body = req.body
    createProject(body.name, body.repo, req.params.teamId, body.userIds)
        .then((result => resp.json(result)))
        .catch((err) => { resp.status(400).json({ message: err.message }) });
});

//se adauga un user la un proiect
router.route("/users/:userId/projects/:projectId").post((req, resp) => {
    addUserToProject(req.params.projectId, req.params.userId)
        .then((result => resp.json('User added to project')))
        .catch((err) => { resp.status(400).json({ message: err.message }) })
});

//un utilizator este inregistrat ca tester
router.route("/project/:projectId/users/:userId").post((req, resp) => {
    addUserAsTester(req.params.projectId, req.params.userId)
        .then((result => resp.json(result)))
        .catch((err) => { resp.status(400).json({ message: err.message }) })
});


//afiseaza toate bug-urile
router.route("/bugs").get((req, resp) => {
    listBugs(req.query.userId, req.query.projectId)
        .then((result => resp.json(result)))
        .catch((err) => { resp.status(400).json({ message: err.message }) })
});

//se adauga un bug la un proiect (DOAR de catre testeri)
router.route("/projects/:projectId/bugs").post((req, resp) => {
    let body = req.body
    addBugToProject(body.severity, body.priority, body.description, req.params.projectId)
        .then((result => resp.json(result)))
        .catch((err) => { resp.status(400).json({ message: err.message }) })
});

//un user (DOAR membru al unei echipe) isi asigneaza un bug
router.route("/bugs/:bugId/users/:userId").put((req, resp) => {
    assignBugToUser(req.params.userId, req.params.bugId)
        .then((result) => resp.json(result))
        .catch((err) => { resp.status(400).json({ message: err.message }) })
});

//se updateaza starea bug-ului, care devine acum rezolvat
router.route("/bugs/:bugId/resolve").put((req, res) => {
    setBugIsFixed(req.params.bugId, req.body.commit)
        .then((result) => res.json(result))
        .catch((err) => { res.status(400).json({ message: err.message }) })
});


//sterge un proiect cu id-ul specificat
router.route("/project/:projectId").delete((req, res) => {
    Project.findByPk(req.params.projectId).then(record => {
        if (record !== null)
            record.destroy();
        else { throw Error("This project does not exist") }
    })

        .then(() => res.json(`The project with the id ${req.params.projectId} was deleted successfully.`))
        .catch((err) => { res.status(400).json({ message: err.message }) });
});

//sterge un user dintr-o anumita echipa
router.route("/users/:userId/teams/:teamId").delete((req, res) => {
    TeamUser.findOne({
        where: {
            teamId: req.params.teamId,
            userId: req.params.userId
        }
    }).then(teamUser => {
        if (teamUser !== null) { teamUser.destroy() }
        else {  throw Error("This user does not exist")}
    })
      .then(()=> res.json(`The user was deleted successfully.`))
      .catch((err) => { res.status(400).json({ message: err.message }) });
});

router.route("/login").post((req, res)=>{
    login(req.body.email, req.body.password)
    .then((result) => res.json(result))
    .catch((err) => { res.status(400).json({ message: err.message }) })
});




var port = 8000;
app.listen(port, () => console.log("server is listening ..."));