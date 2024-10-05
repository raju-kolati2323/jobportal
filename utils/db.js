import mongoose from "mongoose";

const connectDB = async () => {
    const localUri = 'mongodb+srv://satyainnowide:jobportal@jobportal.uouvx.mongodb.net/?retryWrites=true&w=majority&appName=jobPortal';
   // process.env.MONGO_URI
    try {
        await mongoose.connect(localUri);
        console.log('mongodb connected successfully');
    } catch (error) {
        console.log(error);
    }
}
export default connectDB;