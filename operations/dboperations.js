import sql from "mssql"
import pkg from "sequelize";
const { Op } = pkg;
import { User, seqelize, Team, TeamUser, Project, ProjectUser, Bug, statusEnum, priorityEnum, severityEnum } from "../sequelize/sequelize.js"


export async function createUser(email, password, firstName, lastName) {
    try {
        const existingUserWithEmail = await User.findOne({
            where: {
                email: email
            }
        })
        if (existingUserWithEmail != null){
            throw Error("An user with this email already exists")
        }
        const user = await User.create({
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        });
        console.log(user.toJSON());
        return user;
    }
    catch (error) {
        console.log(error);
    }
}

export async function listUsers(teamId) {
    try {
        var users = []
        console.log(`teamId: ${teamId}`)
        if (teamId == null) {
            users = User.findAll()
        } else {
            users = User.findAll({
                where: {
                    "$teamuser.teamId$": teamId
                }
            })
        }
        return users;
    }
    catch (error) {
        console.log(error);
    }
}

export async function addUserToTeam(teamId, userId) {
    try {
        const userAlreadyInTeam = await TeamUser.findOne({
            where:{
                teamId: teamId,
                userId: userId
            }
        })
        if (userAlreadyInTeam != null){
            throw Error("This user is already in this team")
        }
        await 
        await TeamUser.create({
            teamId: teamId,
            userId: userId
        });
        console.log("User added to team");
    }
    catch (error) {
        console.log(error);
    }
}

export async function createProject(name, repo, teamId, userIds) {
    try {
        const alreadyProjectWithName = await Project.findOne({
            where:{
                name: name,
                teamId: teamId
            }
        })
        if (alreadyProjectWithName != null){
            throw Error("There already is a project with this name in this team")
        }
        const project = await Project.create({
            name: name,
            repo: repo,
            teamId: teamId
        });
        if (userIds == null){
            userIds = []
        }
        const existingUsers = await User.findAll({
            where:{
                id: {
                    [Op.in]: userIds
                }
            }
        })
        const existingUsers2 = []
        existingUsers.forEach(user => {
            existingUsers2.push(user.id)
        })
        console.log(`qwe ${existingUsers2[0]}`)
        console.log("Created project");
        if (userIds != null) {
            userIds.forEach(userId => {
                if (!existingUsers2.includes(userId)){
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
    catch (error) {
        console.log(error);
    }
}

export async function addUserToProject(projectId, userId) {
    try {
        const project = await Project.findByPk(projectId);

        const existingUsersInTeam = await TeamUser.findAll({
            where:{
                teamId: project.teamId
            }
        })
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
    catch (error) {
        console.log(error);
    }
}


export async function addUserAsTester(projectId, userId) {
    try {
        const project = await Project.findByPk(projectId);

        const existingUsersInTeam = await TeamUser.findAll({
            where:{
                teamId: project.teamId
            }
        })
        const existingUsersInTeam2 = []
        existingUsersInTeam.forEach(teamUser => {
            existingUsersInTeam2.push(teamUser.userId)
        })
        if (existingUsersInTeam2.includes(parseInt(userId))){
            throw Error("This user is already a member in the project's team")
        }

        ProjectUser.create({
            projectId: project.id,
            userId: userId,
            isTester: true
        })
        console.log("Tester added to project")
    }
    catch (error) {
        console.log(error);
    }
}

export async function addBugToProject(severity, priority, description, projectId) {
    try {
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
    catch (error) {
        console.log(error);
    }
}

export async function assignBugToUser(userId, bugId) {
    try {
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
        currentBug.userId = userId
        currentBug.status = statusEnum.inProgress
        await (await currentBug).save()

        return currentBug;
    }
    catch (error) {
        console.log(error);
    }
}

export async function setBugIsFixed(bugId, commit) {
    try{
        //TODO: check that the currentUser is the assiged user from the selected bug
        const currentBug = await Bug.findByPk(bugId)
        if (currentBug.status != statusEnum.inProgress){
            throw Error("Cannot resolve a bug that is not assigned")
        }
        currentBug.status = statusEnum.finished
        currentBug.commit = commit
        await (await currentBug).save()
        return currentBug;
    }
    catch(error){
        console.log(error);
    }
}