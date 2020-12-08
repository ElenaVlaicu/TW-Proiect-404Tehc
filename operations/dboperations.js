import sql from "mssql"
import { config } from "../config/dbconfig.js"
import { User, seqelize} from "../sequelize/sequelize.js"


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
