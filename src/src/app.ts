import {ApplicationStates, setApplicationState} from "./services/ApplicationStateService";
import {initExpress} from "./api/express";
import {initAppDataSource} from "./data-source";
import {checkAndGenerateRootAuthentication} from "./services/Authentication";


async function startApplication() {

    await initAppDataSource();

    initExpress();

    await checkAndGenerateRootAuthentication();
    setApplicationState(ApplicationStates.StartupComplete, true);
}

startApplication()
    .then(() => console.log("started application successfully"))
    .catch(e => {
        throw e
    });
