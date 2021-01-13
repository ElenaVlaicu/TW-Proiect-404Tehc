import sql from "mssql"
import pkg from "sequelize";
const { Op } = pkg;
import { User, seqelize, Team, TeamUser, Project, ProjectUser, Bug, statusEnum, priorityEnum, severityEnum } from "../sequelize/sequelize.js"


//creaza un user
export async function createUser(email, password, firstName, lastName) {
        //cautam daca exista deja un user cu acest email (mail-ul este unic pt fiecare user)
        const existingUserWithEmail = await User.findOne({
            where: {
                email: email
            }
        })

        //daca exista deja un user cu acest mail se arunca eroarea
        if (existingUserWithEmail != null){
            throw Error("An user with this email already exists")
        }

        //daca nu exista deja userul, se creaza
        const user = await User.create({
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        });

        console.log(user.toJSON());
        return user;
    }

//afiseaza toti userii, sau doar userii dintr-un proiect sau doar userii dintr-o echipa
//in functie de parametrii primiti
export async function listUsers(teamId,projectId) {
    try {
        //daca exista proiectul specificat, se doreste afisarea tuturor utilizatorilor din proiect
        var users = []
        if(projectId != null){
            users = User.findAll({
                include: [
                    {
                        required: true,
                        model: Project,
                        through: { where: {
                            projectId: projectId
                        }}
                    }
                ]
            })
         }
         //daca exista echipa specificata, se doreste afisarea utilizatorilor din echipa
            else if(teamId != null){
            users = User.findAll({
                include: [
                    {
                        required: true,
                        model: Team,
                        through: { where: {
                            teamId: teamId
                        }}
                    }
                ]
            })
        }
        //daca nu este specificata o echipa, se afiseaza toti utilizatorii din toate echipele
        else if (teamId == null) {
            users = User.findAll()
        }
        return users;
    }
    catch (error) {
        console.log(error);
    }
}

export async function listTeams(){
    return await Team.findAll();
}

export async function listProjects(teamId){

    //verificam daca exista echipa
   
    if (teamId==null){
        return await Project.findAll();
    }
    else {
        const team = await Team.findByPk(teamId);
        if(team==null){
            throw Error("This team does not exist")
        }
        return await Project.findAll({
            where: {teamId: teamId}
        });
    }
}

//adauga un utilizator intr-o echipa
export async function addUserToTeam(teamId, userId) {

        //verificam daca utilizatorul nu este deja in aceasta echipa
        const userAlreadyInTeam = await TeamUser.findOne({
            where:{
                teamId: teamId,
                userId: userId
            }
        })

        //verificam daca utilizatorul exista in baza de date
        const existingUser = await User.findByPk(userId);
        if(existingUser==null){
            throw Error("This user does not exists")
        }
        if (userAlreadyInTeam != null){
            throw Error("This user is already in this team")
        }

        //se adauga o inregistrare in tabela de legatura
        await 
        await TeamUser.create({
            teamId: teamId,
            userId: userId
        });
        console.log("User added to team");
    }

//se creaza un nou proiect pentru o anumita echipa
export async function createProject(name, repo, teamId, userIds) {
        //verificam daca nu exista deja un proiect cu acest nume
        const alreadyProjectWithName = await Project.findOne({
            where:{
                name: name,
                teamId: teamId
            }
        })
        if (alreadyProjectWithName != null){
            throw Error("There already is a project with this name in this team")
        }
        //se creaza proiectul
        const project = await Project.create({
            name: name,
            repo: repo,
            teamId: teamId
        });

        if (userIds == null){
            userIds = []
        }

        //verificam daca utilizatorii primiti ca parametru exista in baza de date
        const existingUsers = await User.findAll({
            where:{
                id: {
                    [Op.in]: userIds
                }
            }
        })
        const existingUsersIds = []
        existingUsers.forEach(user => {
            existingUsersIds.push(user.id)
        })
        console.log("Created project");
        console.log(userIds)
        console.log(existingUsersIds)
        if (userIds != null) {
            userIds.forEach(userId => {
                if (!existingUsersIds.includes(parseInt(userId))){
                    throw Error(`Invalid user id: ${userId}`)
                }
                ProjectUser.create({
                    projectId: project.id,
                    userId: userId,
                    isTester: false
                })
                console.log("User added to project")
            })
        }
        return project;
    }
   

//adauga un user la un proiect specificat
export async function addUserToProject(projectId, userId) {

        //verificam daca exista proiectul
        const project = await Project.findByPk(projectId);
        if(project==null){
            throw Error("This project does not exist")
        }

        //verificam ca userul sa existe deja in echipa proiectului
        const existingUsersInTeam = await TeamUser.findAll({
            where:{
                teamId: project.teamId
            }
        });
        const existingUsersInTeam2 = []
        existingUsersInTeam.forEach(teamUser => {
            existingUsersInTeam2.push(teamUser.userId)
        })
        if (!existingUsersInTeam2.includes(parseInt(userId))){
            throw Error("This user is not in the project's team")
        }

        ProjectUser.create({
            projectId: project.id,
            userId: userId,
            isTester: false
        })
        console.log("User added to project")
    }

//modificam statutul unui utilizator facandu-l tester
export async function addUserAsTester(projectId, userId) {

         //verificam daca utilizatorul exista in baza de date
         const existingUser = await User.findByPk(userId);
         if(existingUser==null){
             throw Error("This user does not exist")
         }

          //verificam daca proiectul exista in baza de date
         const existingProject = await Project.findByPk(projectId);
         if(existingProject==null){
             throw Error("This project does not exist")
         }

        //cautam proiectul in care dorim sa adaugam un tester
        const project = await Project.findByPk(projectId);

        //verificam ca userul pe care dorim sa il facem tester sa nu fie membru al echipei proiectului
        const existingUsersInTeam = await TeamUser.findAll({
            where:{
                teamId: project.teamId
            }
        })

        //ne cream un vector cu id-urile tuturor utilizatorilor din echipa
        const existingUsersInTeam2 = []
        existingUsersInTeam.forEach(teamUser => {
            existingUsersInTeam2.push(teamUser.userId)
        })
        if (existingUsersInTeam2.includes(parseInt(userId))){
            throw Error("This user is already a member in the project's team")
        }
        //se creaza o inregistrare in tabela de lagatura 
        ProjectUser.create({
            projectId: project.id,
            userId: userId,
            isTester: true
        })
        console.log("Tester added to project")

        return existingUser;
    }

    export async function listBugs(userId, projectId) {

        //verificam daca utilizatorul exista in baza de date

        if(userId){
            const existingUser = await User.findByPk(userId);
            if(existingUser==null){
                throw Error("This user does not exist")
            }
   
               const bugs = []
               const myProjectIds = ProjectUser.findAll({
                   where: {
                       userId: userId
                   },
                   attributes: ['id'],
                   raw: true
               })
               bugs = Bug.findAll({
                   where: {
                       projectId: {in: myProjectIds}
                   }
               })
               return bugs;
        }
        else if(projectId){
            const existingProject = await Project.findByPk(projectId);
            if(existingProject==null){
                throw Error("This project does not exist");
        }

        return await Bug.findAll({
            where: {projectId: projectId}
        });

        }
        else return await Bug.findAll();
    }

//adauga un bug intr-un proiect
export async function addBugToProject(severity, priority, description, projectId) {

         //verificam daca proiectul exista in baza de date
         const existingProject = await Project.findByPk(projectId);
         if(existingProject==null){
             throw Error("This project does not exist")
         }

        //verificam daca severitatea si prioritatea sunt valide conform enum-urilor
        const project = await Project.findByPk(projectId);

        if (!Object.keys(severityEnum).includes(severity)){
            throw Error("Invalid severity selected")
        }

        if (!Object.keys(priorityEnum).includes(priority)){
            throw Error("Invalid priority selected")
        }

        const bug = Bug.create({
            projectId: project.id,
            severity: severity,
            priority: priority,
            description: description,
            status: statusEnum.unassigned
        })
        console.log("Added bug to project")
        return bug;
    }

//se asigneaza un bug unui user
export async function assignBugToUser(userId, bugId) {

         //verificam daca userul exista in baza de date
         const existingUser = await User.findByPk(userId);
         if(existingUser==null){
             throw Error("This user does not exist")
         }

          //verificam daca bug-ul exista in baza de date
          const existingBug = await Bug.findByPk(bugId);
          if(existingBug==null){
              throw Error("This bug does not exist")
          }

        //verificam daca userul este in proiectul unei echipe si daca bug-ul este deja asignat
        const currentBug = await Bug.findByPk(bugId)
        const projectUser = await ProjectUser.findOne({
            where: {
                isTester: false,
                userId: userId
            }
        })

        if (projectUser == null){
            throw Error("Selected user is not in the project's team")
        }

        if (currentBug.userId != null) {
            throw Error("Bug is already assigned")
        }

        //schimbam statusul bug-ului
        currentBug.userId = userId
        currentBug.status = statusEnum.inProgress
        await (await currentBug).save()

        return currentBug;
}

//modificam statusul unui bug
export async function setBugIsFixed(bugId, commit) {

    //TODO: check that the currentUser is the assiged user from the selected bug
    
    //verificam daca bug-ul exista in baza de date
    const existingBug = await Bug.findByPk(bugId);
        if(existingBug==null){
             throw Error("This bug does not exist")
         }

         //verificam ca bug-ul nu este deja asignat
        const currentBug = await Bug.findByPk(bugId)
        if (currentBug.status != statusEnum.inProgress){
            throw Error("Cannot resolve a bug that is not in progress")
        }

        //modificam statusul bug-ului
        currentBug.status = statusEnum.finished
        currentBug.commit = commit
        await (await currentBug).save()
        return currentBug;
}

export async function login(email, password){

    const user = await User.findOne({
        where: {email: email,
                 password: password}
    })

    if(user==null){
        throw Error("User does not exist")
    }


     let token = await generateToken(30);
     console.log(token)

    user.token = token;
    await (await user).save();

    return user;
}

export async function loginByToken(token){

    const user = await User.findAll({
        where: {token: token}
    })

    if(user==null){
        throw Error("User does not exist")
    }

    return user;
}


export async function generateToken(length) {
    var result = ''; 
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
    var charactersLength = characters.length; 
    for ( var i = 0; i < length; i++ ) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength)); }
    return result; 
} 
    


