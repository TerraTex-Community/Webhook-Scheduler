// import cors from "cors";
import express, {Request, Response} from "express";
// import session from "express-session";
// import {AppDataSource} from "../data-source";
import {logger} from "../logger";
import audit from "express-requests-logger";
import GeneralRouter from "./GeneralRouter";


export function initExpress() {
    const app = express();

    // app.use(cors({
    //     origin: (requestOrigin, callback) => {
    //         if (!requestOrigin) callback(null, false);
    //         else if (requestOrigin.indexOf("localhost") != -1) return callback(null, true);
    //         else callback(null, false);
    //     },
    //     credentials: true
    // }))


    app.use(express.urlencoded({
        extended: true
    }))
    app.use(express.json());

    app.use(audit({
        logger: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            info: (data: any) => {
                if (data.request.body && data.request.body.length > 0 && data.request.body !== "N/A") {
                    try {
                        data.request.body_parsed = JSON.parse(data.request.body as string);
                    } catch (e) {
                        data.request.body_parsed = {};
                    }
                }

                if (data.response.body && data.response.body.length > 0 && data.response.body !== "N/A") {
                    try {
                        data.response.body_parsed = JSON.parse(data.response.body as string);
                    } catch (e) {
                        data.response.body_parsed = {};
                    }
                }

                logger.info(`HTTP REQUEST: ${data.request.method} ${data.request.url}`, {
                    req: data.request,
                    res: data.response
                });
            },
        },
        excludeURLs: ["health", "metrics"], // Exclude paths which include 'health' & 'metrics'
        request: {
            maskBody: ["password"], // Mask 'password' field in incoming requests
            excludeHeaders: ["authorization"]
        }
    }));

    app.use(GeneralRouter);

    // app.use(session({
    //     secret: "venus_lounge",
    //     resave: false,
    //     saveUninitialized: true,
    //     store: new TypeormStore({
    //         cleanupLimit: 2,
    //         limitSubquery: false, // If using MariaDB.
    //         ttl: 86400
    //     }).connect(AppDataSource.getRepository(Session)),
    // }));

    // catch 404 and forward to error handler
    app.use(function (req, res) {
        res.status(404);
        res.send('Site ' + req.originalUrl + ' Not Found');
    });

    app.use(function(err: Error, req: Request, res: Response) {
        logger.error(err.message, {error: err, req: req, res: res});
        res.status(500).send('Something broke!');
    });

    app.listen(5000)
}
