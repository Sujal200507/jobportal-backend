import express from "express";
import isAuthenticated from "../auth/isAuthenticated.js";
import { getAllJobs, getJobById, getJobByLoggedAdminUser, postJob } from "../controllers/job.controller.js";
 
const router = express.Router();

router.route("/postjob").post( isAuthenticated , postJob);
router.route("/all").get(getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, getJobByLoggedAdminUser);
router.route("/:id").get(getJobById);


export default router;