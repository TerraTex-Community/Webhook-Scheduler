import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Application } from '../db/entities/Application';
import fs from "fs";
import {InternalConfig} from "../InternalConfigs";
import crypto from 'crypto';
import {logger} from "../logger";

/**
 * Retrieve the Application ID from a JWT
 * @param req the HTTP request
 * @returns the Application ID - as Middleware should check upfront if jwt is valid it returns ApplicationId
 */
export function getApplicationIdFromJwt(req: Request<any>): number {
    const authHeader = req.headers.authorization as string;
    const token = authHeader.split(' ')[1]; // Bearer Token

    // Decode the JWT
    const decoded: any = jwt.decode(token);

    // Extract the applicationId. Adjust this according to your JWT structure
    return decoded.applicationId;
}

async function doesApplicationHaveSystemPrivilege(applicationId: number): Promise<boolean> {
    const application = await Application.findOne({where: {id: applicationId}});

    return application?.hasSystemPrivilege || false;
}

export const mwHasSystemPrivilege = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await tokenOr403(req, res);

        // Now we need to check the applicationId
        const applicationId: number = data.applicationId;

        const hasSystemPrivilege = await doesApplicationHaveSystemPrivilege(applicationId);
        if(!hasSystemPrivilege) {
            return res.status(403).send('Application does not have system privileges');
        }

        next();
    } catch (e) {
        if (res.headersSent)
            return;
        else
            res.sendStatus(500)
        throw e;
    }
};

export const mwIsJwtValid = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await tokenOr403(req, res);

        // Now we need to check the applicationId
        const applicationId: number = data.applicationId;

        const application = await Application.findOne({where: {id: applicationId}});
        if(!application) {
            return res.status(403).send('Application does not exist anymore - jwt invalid');
        }

        next();
    } catch (e) {
        if (res.headersSent)
            return;
        else
            res.sendStatus(500)
        throw e;
    }
};

/**
 * Checks the presence of a JWT token within the Authorization header of the
 * incoming request and verifies it. If the token is valid, it returns the decoded data.
 *
 * @param {Request} req - Express Request object
 * @param {Response} res - Express Response object
 *
 * @throws Will throw an error if the Authorization header is missing or if the JWT token is invalid
 *
 * @returns {Promise<any>} - Decoded data from the token payload if verification is successful
 *
 * @example
 * try {
 *   const data = await tokenOr403(req, res);
 *   // Use the data
 * } catch(err) {
 *   console.error(err);
 *   // Handle the error
 * }
 */
export const tokenOr403 = async (req: Request, res: Response): Promise<any> => {
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        res.sendStatus(401);
        throw new Error('No authorization header');
    }

    try {
        const token = authHeader.split(' ')[1]; // Bearer token
        const cert = fs.readFileSync(`certs/${InternalConfig.certName}.pem`);
        return await new Promise((resolve, reject) => jwt.verify(token, cert, (err, data) => err ? reject(err) : resolve(data)));
    } catch (err) {
        res.sendStatus(403);
        throw err;
    }
};

export async function sameApplicationIdSystemPrivilegeOr403(appId: number, req: Request<any>, res: Response): Promise<boolean> {
    const applicationId: number = getApplicationIdFromJwt(req);
    const hasSystemPrivilege = await doesApplicationHaveSystemPrivilege(applicationId);
    if (appId !== applicationId && !hasSystemPrivilege) {
        res.status(403).send({message: "Jwt has no access to this job or system privilege"});
        return false
    }
    return true;
}

export const verifyJWTToken = (token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const cert = fs.readFileSync(`certs/${InternalConfig.certName}.pem`);
        jwt.verify(token, cert, (err: any, data: any) => {
            if(err) {
                reject(err);
            }
            else{
                resolve(data);
            }
        });
    });
};

export function generateJwt(applicationId: number) {
    const cert = fs.readFileSync(`certs/${InternalConfig.certName}.pem`);
    return jwt.sign({ applicationId }, cert, { expiresIn: '7d' });
}

export async function checkAndGenerateRootAuthentication() {
    const rootAuthKey = crypto.randomBytes(16).toString('hex');
    const rootAuthSecret = crypto.randomBytes(32).toString('hex');
    const applicationSecurityToken = crypto.randomBytes(32).toString('hex');

    let application = await Application.findOne({ where: { hasSystemPrivilege: true } });

    if (!application) {
        // If there is no application with systemprivilege, create one
        application = new Application();
        application.name = "root-access";
        application.authKey = rootAuthKey;
        application.authSecret = rootAuthSecret;
        application.applicationSecurityToken = applicationSecurityToken;
        application.hasSystemPrivilege = true;
        await application.save();

        logger.info("Root Authentication missing - create new credentials", {
            rootAuthKey,
            rootAuthSecret
        });
    }
}