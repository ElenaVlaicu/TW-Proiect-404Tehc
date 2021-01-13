import pkg from "sequelize";
const { Sequelize, DataTypes, Model } = pkg;
import { port, username, password } from "../settings_local.js"

//enum-uri pentru clasa Bug
export const severityEnum = Object.freeze({ "blocker": 1, "urgent": 2, "minor threat": 3 });
export const priorityEnum = Object.freeze({ "high": 1, "medium": 2, "low": 3 });
export const statusEnum = Object.freeze({ "unassigned": 1, "inProgress": 2, "finished": 3 });


export const seqelize = new Sequelize({
    dialect: 'mssql',
    host: 'localhost',
    username: username,
    password: password,
    database: 'database',
    port: port,
    options: {
        trustedConnection: true,
        enableArithAbort: true
    },
});

export class Team extends Model { };
Team.init({
    name: DataTypes.STRING
}, { sequelize: seqelize, modelName: "team" });

seqelize.authenticate().then(() => { console.log("Sequelize has succesfully connected to the database") })
    .catch(err => console.error(err));

seqelize.sync({ force: false, alter: false })
    .then(() => { console.log("Sincronizare completa") })
    .catch(err => console.log("eroare la: " + err));

   //---USER---//

export class User extends Model { };
User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    token: DataTypes.STRING
}, { sequelize: seqelize, modelName: "user" });

   //---Tabela de legatura pentru many to many intre user si team---//

export class TeamUser extends Model { };
TeamUser.init({
}, { sequelize: seqelize, modelName: "teamUser" });

User.belongsToMany(Team, { through: TeamUser});

   //---PROJECT---//

export class Project extends Model { };
Project.init({
    name: DataTypes.STRING,
    repo: DataTypes.STRING
}, { sequelize: seqelize, modelName: "project" });
Team.hasMany(Project);

   //---BUG---//

export class Bug extends Model { };
Bug.init({
    severity: DataTypes.STRING,
    priority: DataTypes.STRING,
    description: DataTypes.STRING,
    commit: DataTypes.STRING,
    status: DataTypes.STRING
}, { sequelize: seqelize, modelName: "bug" });
Project.hasMany(Bug);
User.hasMany(Bug);

 //---Tabela de legatura pentru many to many intre project si user---//

export class ProjectUser extends Model { };
ProjectUser.init({
    isTester: DataTypes.BOOLEAN
}, { sequelize: seqelize, modelName: "projectUser" });

Project.belongsToMany(User, { through: ProjectUser});
User.belongsToMany(Project, { through: ProjectUser})