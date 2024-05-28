import {DataSource} from "typeorm";
import {EnvConfig} from "./InternalConfigs";
import {ApplicationStates, setApplicationState} from "./services/ApplicationStateService";

export async function initAppDataSource() {
    AppDataSource = new DataSource({
        type: "mariadb",
        database: EnvConfig.database.database,
        username: EnvConfig.database.username,
        password: EnvConfig.database.password,
        host: EnvConfig.database.host ?? "localhost",
        charset: "utf8mb4",
        synchronize: false,
        timezone: "Z",
        logging: false,
        entities: [
            "src/db/entities/*"
        ],
        subscribers: [
            "src/db/subscriber/*"
        ],
        migrations: [
            "src/db/migration/*"
        ],
        migrationsRun: true
    });

    await AppDataSource.initialize();

    setApplicationState(ApplicationStates.DatabaseReady, true);
}

export let AppDataSource: DataSource;
