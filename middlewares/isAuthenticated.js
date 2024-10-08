import jwt from "jsonwebtoken";

// const isAuthenticated = async (req, res, next) => {
//     try {
//         const token = req.cookies.token;
//         if (!token) {
//             return res.status(401).json({
//                 message: "User not authenticated",
//                 success: false,
//             })
//         }
  
//         const decode = await jwt.verify(token,process.env.SECRET_KEY);
//         if(!decode){
//             return res.status(401).json({
//                 message:"Invalid token",
//                 success:false
//             })
//         };
//         req.id = decode.userId;
//         next();
//     } catch (error) {
//         console.log(error);
//     }
// }

const isAuthenticated = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized", success: false });
    }

        console.log("Token:", token);
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.id = decoded.userId; // Ensure the user ID is attached to the request
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized", success: false });
    }
};
export default isAuthenticated;