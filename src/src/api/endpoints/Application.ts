import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { Application } from '../../db/entities/Application';
import {mwHasSystemPrivilege} from "../../services/Authentication";

// Define the shape of the body for POST and PUT requests
interface PostRequestBody {
    webhookUrl?: string;
    name: string;
    stationName?: string;
    hasSystemPrivilege: boolean;
}

interface PutRequestBody {
    webhookUrl?: string;
    name?: string;
    stationName?: string;
    hasSystemPrivilege?: boolean;
}

// Define the shape of the GET query parameters
interface GetQuery {
    id: string;
}

interface ErrorResponse {
    message: string;
}

// Fetch application using ID and handle failure case
async function findApplicationOrThrowError(id: unknown, res: Response<Application | ErrorResponse>) {
    try {
        if (typeof id !== 'number' || isNaN(id)) {
            res.status(404).send({message: 'Application not found'});
            return null;
        }

        const application = await Application.findOne({
            where: {
                id: id as number
            }
        });
        if (application) {
            return application;
        } else {
            res.status(404).send({message: 'Application not found'});
            return null;
        }
    } catch (e) {
        res.status(500).send(e);
        return null;
    }
}

const router = express.Router();
router.use(mwHasSystemPrivilege);

// POST endpoint to create a new application
router.post('/', async (req: Request<undefined, Application | ErrorResponse, PostRequestBody>, res: Response<Application | ErrorResponse>) => {
    // Destructure request body
    const { name, webhookUrl, stationName, hasSystemPrivilege } = req.body;

    // Validate request body
    if (!webhookUrl && !stationName) {
        res.status(400).send({ message: 'Either [webhookUrl] or [stationName] must be provided' });
        return;
    }

    if (!name) {
        return res.status(400).send({ message: 'Field [name] missing: Please add a Description / Name'});
    }

    // Generate new application values
    const authKey = uuidv4();
    const authSecret = crypto.randomBytes(20).toString('hex');
    const applicationSecurityToken = crypto.randomBytes(20).toString('hex');

    // Create and save new application
    const application = Application.create({ name, authKey, authSecret, applicationSecurityToken, webhookUrl, stationName, hasSystemPrivilege });
    await application.save();

    res.send(application);
});

// GET endpoint to fetch an application by ID
router.get('/:id', async (req: Request<GetQuery, Application | ErrorResponse>, res: Response<Application | ErrorResponse>) => {
    const application = await findApplicationOrThrowError(Number(req.params.id), res);
    if (application) {
        res.send(application);
    }
});

// GET endpoint to fetch an application by ID
router.get('/', async (req: Request<GetQuery, Application[] | ErrorResponse>, res: Response<Application[] | ErrorResponse>) => {
    const applications = await Application.find();
    if (applications) {
        res.send(applications);
    }
});


// PUT endpoint to update an application by ID
router.put('/:id', async (req: Request<GetQuery, Application | ErrorResponse, PutRequestBody>, res: Response<Application | ErrorResponse>) => {
    // Destructure request body
    const { name, webhookUrl, stationName, hasSystemPrivilege } = req.body;

    // Fetch application
    const application = await findApplicationOrThrowError(Number(req.params.id), res);
    if (application) {
        // Update application fields if provided
        if (webhookUrl !== undefined) {
            application.webhookUrl = webhookUrl;
        }
        if (name !== undefined) {
            application.name = name;
        }
        if (stationName !== undefined) {
            application.stationName = stationName;
        }
        if (hasSystemPrivilege !== undefined) {
            application.hasSystemPrivilege = hasSystemPrivilege;
        }
        await application.save();
        res.send(application);
    }
});

// DELETE endpoint to delete an application by ID
router.delete('/:id', async (req: Request<GetQuery, Application | ErrorResponse>, res: Response) => {
    const application = await findApplicationOrThrowError(Number(req.params.id), res);
    if (application) {
        await application.remove();
        res.sendStatus(204);
    }
});

export default router;

