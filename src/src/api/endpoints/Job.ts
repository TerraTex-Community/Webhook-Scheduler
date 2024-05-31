// Import necessary modules from their relative paths
import express, { Request, Response } from 'express';
import { Job, JobExecutionType } from '../../db/entities/Job';
import { Application } from '../../db/entities/Application';
import {
    getApplicationIdFromJwt,
    mwHasSystemPrivilege,
    mwIsJwtValid,
    sameApplicationIdSystemPrivilegeOr403
} from "../../services/Authentication";

// Interfaces used for strict typing of request bodies and parameters
interface PostPutRequestBody {
    taskKey?: string;
    payload?: any;
    jobExecutionType?: keyof typeof JobExecutionType;
}

interface GetQuery {
    id: string;
}

// Initialize new router instance
const router = express.Router();

/**
 * Utility function to validate the job execution type.
 * @param {string} value - The execution type to validate.
 * @returns {boolean} - Returns true if the execution type is valid, otherwise false.
 */
function isValidJobExecutionType(value: string): boolean {
    return Object.values(JobExecutionType).includes(value as unknown as JobExecutionType);
}

router.use(mwIsJwtValid);

/**
 * A helper function to get a job by its ID. If a job isn't found, respond with a 404 status.
 * @param {number} id - The ID of the job
 * @param {Response<Job | string>} res - The response object
 * @returns {Promise<Job | undefined>} - Returns the job if found or undefined
 */
async function getJobOr404(id: number, res: Response<Job | string>): Promise<Job | undefined> {
    const job = await Job.findOne({where: {id}});
    if (!job) {
        res.status(404).send('Job not found');
        return;
    }
    return job;
}

// Get job by id endpoint
router.get('/:id', async (req: Request<GetQuery, Job | string>, res: Response<Job | string>) => {
    const job = await getJobOr404(Number(req.params.id), res);
    if(job) {
        if (!await sameApplicationIdSystemPrivilegeOr403(job.application.id, req, res)) {
            return;
        }

        res.send(job);
    }
});


// Post (or create) new job endpoint
router.post('/', async (req: Request<undefined, Job | string, PostPutRequestBody>, res: Response<Job | string>) => {
    const applicationId = getApplicationIdFromJwt(req);
    const application = await Application.findOne({where: {id: applicationId}});

    if (application && req.body.jobExecutionType && isValidJobExecutionType(req.body.jobExecutionType)) {
        const jobExecutionType = JobExecutionType[req.body.jobExecutionType];
        const job = Job.create({
            ...req.body,
            lastExecution: null,
            lastFailedCount: 0,
            jobExecutionType,
            application
        });

        await job.save();
        return res.send(job);
    }

    return res.status(400).send('Invalid request');
});

// UpdateData type
type UpdateData = Partial<{[K in keyof PostPutRequestBody]: K extends 'jobExecutionType' ? JobExecutionType : PostPutRequestBody[K]}>;

// Update job endpoint
router.put('/:id', async (req: Request<GetQuery, Job | string, PostPutRequestBody>, res: Response<Job | string>) => {
    const job = await getJobOr404(Number(req.params.id), res);
    if(job && (req.body.jobExecutionType === undefined || isValidJobExecutionType(req.body.jobExecutionType))) {
        if (!await sameApplicationIdSystemPrivilegeOr403(job.application.id, req, res)) {
            return;
        }

        const {taskKey, payload} = req.body;
        const updateData: UpdateData = {taskKey, payload, jobExecutionType: undefined};
        if(req.body.jobExecutionType !== undefined) {
            updateData.jobExecutionType = JobExecutionType[req.body.jobExecutionType];
        }
        Object.assign(job, updateData);
        await job.save();
        res.send(job);
    } else {
        res.status(400).send('Invalid request');
    }
});

// Delete job endpoint
router.delete('/:id', async (req: Request<GetQuery, string>, res: Response<string>) => {
    const job = await getJobOr404(Number(req.params.id), res);
    if(job) {
        if (!await sameApplicationIdSystemPrivilegeOr403(job.application.id, req, res)) {
            return;
        }

        await job.remove();
        res.send(`Job ${req.params.id} deleted`);
    } else {
        res.status(400).send('Invalid request');
    }
});

export default router;