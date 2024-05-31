import fs from "fs";
import * as process from "process";

const file = fs.readFileSync(".env").toString("utf-8");
const regex = /(?<key>[a-z].*)=(?<value>.*)/gi;
const result = Array.from(file.matchAll(regex));
for (const k in result) {
    process.env[result[k].groups!.key] = result[k].groups!.value;
}

export const EnvConfig = {
    database: {
        database: process.env.DB_DATABASE,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST
    },
    isLocal: /^\s*(true|1|on)\s*$/i.test(process.env.IS_LOCAL ?? "false"),
}

export const InternalConfig = {
    certName:  process.env.CERT_NAME || EnvConfig.isLocal ? "local" : "prod",
    logFile:  "logs/scheduler.log",
    // appUrl: EnvConfig.isLocal ? "http://localhost:5000/" : "https:///",
}