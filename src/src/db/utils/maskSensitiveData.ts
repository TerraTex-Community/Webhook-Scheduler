import {isSensitive} from "../decorator/SensitiveInfo";

export function maskSensitiveInfo(obj: any) {
    // clone the input to avoid mutating the original object

    for (let key in obj) {
        if (obj.hasOwnProperty(key) && isSensitive(obj, key)) {
            obj[key] = '****';
        }
        // recur if the value of the current property is an object
        if (obj[key] && typeof obj[key] === 'object' && !(obj[key] instanceof Date)) {
            console.log(key, obj[key], typeof obj[key])
            obj[key] = maskSensitiveInfo(obj[key]);
        }
    }

    return Object.assign({}, obj);
}