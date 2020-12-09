import sql from "mssql"
import { User, seqelize, Team, TeamUser, Project, ProjectUser} from "../sequelize/sequelize.js"


export async function createUser(email, password, firstName, lastName) {
    try{
       const user = await User.create({
           email: email,
           password: password,
           firstName: firstName,
           lastName: lastName
       });
       console.log(user.toJSON());
       return user;
    }
    catch(error){
        console.log(error);
    }
}

export async function listUsers(teamId) {
    try{
        var users = []
        console.log(`teamId: ${teamId}`)
        if (teamId == null){
            users = User.findAll()
        }else{
            users = User.findAll({
                where: {
                    "$teamuser.teamId$": teamId
                }
            })
        }
       return users;
    }
    catch(error){
        console.log(error);
    }
}

export async function addUserToTeam(teamId, userId) {
    try{
       await TeamUser.create({
           teamId: teamId,
           userId: userId
       });
       console.log("User added to team");
    }
    catch(error){
        console.log(error);
    }
}

export async function createProject(name, repo, teamId, userIds) {
    try{
       const project = await Project.create({
           name: name,
           repo: repo,
           teamId: teamId
       });
       console.log("Created project");
       if (userIds != null){
            userIds.forEach(userId => {
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
    catch(error){
        console.log(error);
    }
}