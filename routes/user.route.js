import express from "express";
import { login, logout, register, updateProfile, getAllUsers } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/mutler.js";
 
const router = express.Router();

router.route("/register").post(singleUpload,register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile/update").patch(isAuthenticated,singleUpload,updateProfile);
router.route("/").get( getAllUsers);

export default router;

