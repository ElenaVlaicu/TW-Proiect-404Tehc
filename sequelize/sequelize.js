import pkg from "sequelize";
const {Sequelize, DataTypes, Model } = pkg;
import { port, username, password } from "../settings_local.js"


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


  export class Team extends Model {};
  Team.init({
      name: DataTypes.STRING
  }, {sequelize: seqelize, modelName: "team"});


seqelize.authenticate().then(()=> {console.log("Sequelize has succesfully connected to the database")})
.catch(err => console.error(err));

seqelize.sync({force:false, alter:false})
        .then(()=> {console.log("Sincronizare completa")})
        .catch(err => console.log("eroare la: " + err));

export class User extends Model {};
User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING
}, {sequelize: seqelize, modelName: "user"});

export class TeamUser extends Model {};
TeamUser.init({
}, {sequelize: seqelize, modelName: "teamUser"});

User.belongsToMany(Team, {through: TeamUser});

export class Project extends Model {};
Project.init({
    name: DataTypes.STRING,
    repo: DataTypes.STRING
}, {sequelize: seqelize, modelName: "project"});
Team.hasMany(Project);

export class ProjectUser extends Model {};
ProjectUser.init({
    isTester: DataTypes.BOOLEAN
}, {sequelize: seqelize, modelName: "projectUser"});

Project.belongsToMany(User, {through: ProjectUser});