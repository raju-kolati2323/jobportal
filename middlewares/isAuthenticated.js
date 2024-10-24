import jwt from "jsonwebtoken";

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