import connectDB from './db/index.js';
import { app } from './app.js';
import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
    app.on("error", (err) => {
        console.error("Error : ",err);
        throw err;
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})


/*
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on('error', (err) => {
            console.error(err);
            throw err;
        });
        
        app.listen(process.env.PORT || 8001, () => {
            console.log(`Server is running on port ${process.env.PORT || 8001}`);
        });
        
    } catch (error) {
        console.log(error);
        throw error;
    }
})()

*/