import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getAdminJobs, getAllJobs, getJobById, postJob, deleteJob, updateJob,toggleJobStatus } from "../controllers/job.controller.js";
import { singleUpload } from "../middlewares/mutler.js";
const router = express.Router();

router.route("/post").post(isAuthenticated, postJob);
router.route("/get").get(getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);
router.route("/get/:id").get(getJobById);
router.route("/delete/:id").delete(deleteJob);
router.route("/update/:id").patch(isAuthenticated, singleUpload, updateJob);
router.route("/toggle-status/:id").patch(isAuthenticated, toggleJobStatus);
// router.route("/verify").post(isAuthenticated, verifyAndPostJob);

export default router;