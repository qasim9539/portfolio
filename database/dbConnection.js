import mongoose from "mongoose";


const dbConnection = () => {
    mongoose.connect(process.env.MONGO_URI, {
        dbName: "portfolio"
    }).then(() => {
        console.log("Database connected");
    }).catch((err) => {
        console.log(err);
    })
}   

export default dbConnection
