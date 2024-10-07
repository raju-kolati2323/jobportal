import mongoose from "mongoose";

const connectDB = async () => {
    // const localUri = 'mongodb://localhost:27017/jobportal'
    const localUri="mongodb+srv://satyainnowide:jobportal@jobportal.otswd.mongodb.net/?retryWrites=true&w=majority&appName=JobPortal"
    try {
        await mongoose.connect(localUri);
        console.log('mongodb connected successfully');
    } catch (error) {
        console.log(error);
    }
}
export default connectDB;