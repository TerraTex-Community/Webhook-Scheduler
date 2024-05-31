import express from 'express';
import {generateJwt, mwIsJwtValid, getApplicationIdFromJwt} from '../../services/Authentication';
import {Application} from "../../db/entities/Application";

const router = express.Router();

// Authenticate route
router.post('/', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.sendStatus(401);
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    // Find application by authentication key and secret
    const application = await Application.findOne({
        where: {
                authKey: username,
                authSecret: password
            }
    });

    if (!application) {
        return res.sendStatus(401);
    }

    // Generate JWT token using the `id` of the `Application` instance
    const token = generateJwt(application.id);
    res.json({token});
});

// Check token validity
router.get('/', mwIsJwtValid, (req, res) => {
    return res.json({valid: true, applicationId: getApplicationIdFromJwt(req)});
});

export default router;