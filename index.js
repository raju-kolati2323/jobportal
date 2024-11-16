import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import wishlistRoute from "./routes/wishlist.route.js";
import passwordRouter from "./routes/forgotPassword.route.js";
import paymentRouter from "./routes/payment.route.js";


dotenv.config({});

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const corsOptions = {
    origin:["http://localhost:5173","https://jobportal-03.web.app"],
    // methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    // allowedHeaders: [
    //   "Content-Type",
    //   "Authorization",
    //   "Cache-Control",
    //   "Expires",
    //   "Pragma",
    // ],
    credentials:true
}

app.use(cors(corsOptions));

const PORT = process.env.PORT || 8000;

// api's
app.use("/api/v1/user", userRoute,passwordRouter);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/wishlist", wishlistRoute);
app.use("/api/v1", paymentRouter);

app.listen(PORT,()=>{
    connectDB();
    console.log(`Server running at port ${PORT}`);
})