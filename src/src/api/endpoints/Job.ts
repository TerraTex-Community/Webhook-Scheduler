// Import necessary modules from their relative paths
import express, { Request, Response } from 'express';
import { Job, JobExecutionType } from '../../db/entities/Job';
import { Application } from '../../db/entities/Application';
import { v4 as uuidv4 } from 'uuid';
import {
    getApplicationIdFromJwt,
    mwIsJwtValid,
    sameApplicationIdSystemPrivilegeOr403
} from "../../services/Authentication";
import {isUUID} from "validator";
import {CronExpression, parseExpression} from "cron-parser";
import {ErrorResponse} from "../utils/DefaultResponses";

// Interfaces used for strict typing of request bodies and parameters
interface PostPutRequestBody {
    taskKey?: string; // needs to be generated on POST
    cronExpression?: string; // required on POST
    maxRetries?: number;
    payload?: any;
    jobExecutionType?: keyof typeof JobExecutionType;
    // only internal
    calculatedNextRun?: number;
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
async function getJobOr404(id: number, res: Response<Job | ErrorResponse>): Promise<Job | undefined> {
    const job = await Job.findOne({where: {id}});
    if (!job) {
        res.status(404).send({message: 'Job not found'});
        return;
    }
    return job;
}

// Get job by id endpoint
router.get('/:id', async (req: Request<GetQuery, Job | ErrorResponse>, res: Response<Job | ErrorResponse>) => {
    const job = await getJobOr404(Number(req.params.id), res);
    if(job) {
        if (!await sameApplicationIdSystemPrivilegeOr403(job.application.id, req, res)) {
            return;
        }

        res.send(job);
    }
});


// Post (or create) new job endpoint
router.post('/', async (req: Request<undefined, Job | ErrorResponse, PostPutRequestBody>, res: Response<Job | ErrorResponse>) => {
    const applicationId = getApplicationIdFromJwt(req);
    const application = await Application.findOne({where: {id: applicationId}});
    let verifiedBody: Partial<PostPutRequestBody>;
    try {
        verifiedBody = verifyBody(req.body, false);
    } catch (e) {
        return res.status(400).send({message: e.message})
    }

    const job = Job.create({
        taskKey: verifiedBody.taskKey,
        cronExpression: verifiedBody.cronExpression,
        maxRetries: verifiedBody.maxRetries,
        payload: verifiedBody.payload,
        jobExecutionType: verifiedBody.jobExecutionType as JobExecutionType | undefined,
        calculatedNextRun: verifiedBody.calculatedNextRun
    });

    await job.save();
    return res.send(job);
});


// Update job endpoint
router.put('/:id', async (req: Request<GetQuery, Job | ErrorResponse, PostPutRequestBody>, res: Response<Job | ErrorResponse>) => {
    const job = await getJobOr404(Number(req.params.id), res);

    if (!job || !await sameApplicationIdSystemPrivilegeOr403(job.application.id, req, res)) {
        res.status(404).send({message: 'Job not found'});
        return;
    }

    let verifiedBody: Partial<PostPutRequestBody>;
    try {
        verifiedBody = verifyBody(req.body, false);
    } catch (e) {
        return res.status(400).send({message: e.message})
    }

    Object.assign(job, verifiedBody);
    await job.save();
    res.send(job);
});

// Delete job endpoint
router.delete('/:id', async (req: Request<GetQuery, ErrorResponse>, res: Response<ErrorResponse>) => {
    const job = await getJobOr404(Number(req.params.id), res);
    if(job) {
        if (!await sameApplicationIdSystemPrivilegeOr403(job.application.id, req, res)) {
            return;
        }

        await job.remove();
        res.send({message: `Job ${req.params.id} deleted`});
    } else {
        res.status(400).send({message: 'Invalid request'});
    }
});

/**
 *
 * @param body
 * @param isUpdate
 *
 * @throws Error on Validation failed
 */
function verifyBody(body: PostPutRequestBody, isUpdate = false): Partial<PostPutRequestBody> {
    const verifiedBody: Partial<PostPutRequestBody> = {};
    if (!isUpdate) {
        if (!body.cronExpression) {
           throw new ValidationError('cronExpression is required');
        }
        if (!body.taskKey) {
           verifiedBody.taskKey = uuidv4();
        }
    }

    if (body.cronExpression) {
        let parsedExpression: CronExpression;
        try {
            parsedExpression = parseExpression(body.cronExpression, {
                tz: "Europe/Berlin",
                currentDate: new Date()
            });
        } catch (e) {
            throw new ValidationError('cronExpression is not a valid or supported cron expression');
        }

        if (!parsedExpression.hasNext()) {
            throw new ValidationError('cronExpression is not valid as it is its execution is in past');
        }

        const next = parsedExpression.next().getDate();
        const nextNext = parsedExpression.next().getDate();
        if (nextNext - next < 180000) {
            throw new ValidationError("cronExpress is not valid: Intervals/Repeating Cron Expressions should have longer Intervals than 3 Minutes");
        }

        verifiedBody.cronExpression = body.cronExpression;
        verifiedBody.calculatedNextRun = next;
    }

    if (body.maxRetries !== undefined) {
        // isNumber?
        if (isNaN(body.maxRetries)) {
            throw new ValidationError('maxRetries has to be a number');
        }
        verifiedBody.maxRetries = body.maxRetries;
    }

    if (body.payload) verifiedBody.payload = body.payload;
    if (body.taskKey) {
        if (!isUUID(body.taskKey)) {
            throw new ValidationError("taskKey has to be a UUID");
        }
        verifiedBody.taskKey = body.taskKey;
    }

    if (body.jobExecutionType) {
        if (!isValidJobExecutionType(body.jobExecutionType)) {
            const validTypes = Object.keys(JobExecutionType).filter((item) => {
                return isNaN(Number(item));
            });

            throw new ValidationError(`jobExecutionType has to be one of: ${validTypes.join(",")}`);
        }

        verifiedBody.jobExecutionType = JobExecutionType[body.jobExecutionType as string];
    }

    return verifiedBody;
}

class ValidationError extends Error {}

export default router;