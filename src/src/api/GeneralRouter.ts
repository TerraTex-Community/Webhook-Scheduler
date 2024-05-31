import express from "express";
import Application from "./endpoints/Application";
import Job from "./endpoints/Job";
import State from "./endpoints/State";
import Authentication from "./endpoints/Authentication";

const router = express.Router();
router.use("/application", Application);
router.use("/job", Job);
router.use("/state", State)
router.use("/auth", Authentication);

export default router;