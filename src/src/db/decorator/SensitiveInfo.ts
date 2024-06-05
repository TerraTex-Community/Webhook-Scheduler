export function SensitiveInfo(target: any, key: string) {
    // adding a meta property to indicate this property is sensitive.
    Reflect.defineMetadata('sensitive', true, target, key);
}


export function isSensitive(target: any, key: string) {
    // retrieve the metadata value.
    return Reflect.getMetadata('sensitive', target, key);
}