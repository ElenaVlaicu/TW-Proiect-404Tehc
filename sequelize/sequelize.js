import pkg from "sequelize";
const {Sequelize, DataTypes, Model } = pkg;


export const seqelize = new Sequelize({
    dialect: 'mssql',
    host: 'localhost',
    username: 'sa',
    password: 'sa',
    database: 'database',
    port: "54503",
    options: {
        trustedConnection: true,
        enableArithAbort: true
    },
  });


seqelize.authenticate().then(()=> {console.log("Sequelize has succesfully connected to the database")})
.catch(err => console.error(err));

seqelize.sync({force:false, alter:false})
        .then(()=> {console.log("Sincronizare completa")})
        .catch(err => console.log("erroare la: " + err));

export class User extends Model {};
User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING
}, {sequelize: seqelize, modelName: "user"});

