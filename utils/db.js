import mongoose from "mongoose";

const connectDB = async () => {
    const localUri = 'mongodb://localhost:27017/jobportal'
    try {
        await mongoose.connect(localUri);
        console.log('mongodb connected successfully');
    } catch (error) {
        console.log(error);
    }
}
export default connectDB;