import {ApplicationStates, setApplicationState} from "./services/ApplicationStateService";
import {initExpress} from "./api/express";
import {initAppDataSource} from "./data-source";


async function startApplication() {

    await initAppDataSource();

    initExpress();

    setApplicationState(ApplicationStates.StartupComplete, true);
}

startApplication()
    .then(() => console.log("started application successfully"))
    .catch(e => {
        throw e
    });
