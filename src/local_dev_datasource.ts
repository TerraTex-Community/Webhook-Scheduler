import {DataSource} from "typeorm";

// noinspection all
export const AppDataSource: DataSource = new DataSource({
    "type": "mariadb",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "Asdf123!",
    "database": "tt_scheduler",
 /*   "host": "db.terratex.eu",
    "port": 3306,
    "username": "vl_dev",
    "password": "Asdf123!",
    "database": "vl_dev",*/
    "logging": "all",
    "logger": "debug",
    "entities": [
        "src/db/entities/*"
    ],
    "subscribers": [
        "src/db/subscriber/*"
    ],
    "migrations": [
        "src/db/migration/*"
    ],
    "migrationsRun": true
});