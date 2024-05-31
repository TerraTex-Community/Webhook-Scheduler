import express from "express";
import {getCurrentApplicationState} from "../../services/ApplicationStateService";
import {getInstanceId} from "../../utils/Kubernetes";

const StateRouter = express.Router();

StateRouter.get("/health", (req, res) => {
    const states = getCurrentApplicationState();

    if (states.startupComplete) {
        res.status(200).json(states);
    } else {
        res.status(503).json(states);
    }
});

StateRouter.get("/instance", (req, res) => {

    res.json({
        hostname: process.env.HOSTNAME ?? null,
        instanceId: getInstanceId(),
        nodeVersion: process.env.NODE_VERSION ?? null,
        runOnKubernetes: process.env.run_on_kubernetes ?? null,
        podName: process.env.pod_name ?? null
    })
});

export default StateRouter;