export enum ApplicationStates {
    StartupComplete = "startupComplete",
    DatabaseReady = "databaseReady",
}


const applicationState = {
    startupComplete: false,
    databaseReady: false,
}

export function getCurrentApplicationState() {
    return applicationState;
}


export function setApplicationState(state: ApplicationStates, value: boolean) {
    applicationState[state] = value;
}
