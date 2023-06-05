import { promises as fs } from 'fs'

var config: any;

export async function initConfig() {
    console.log('init');
    config = JSON.parse((await fs.readFile('./config.json')).toString());
    return config;
}

export function getConfig() {
    return config;
}

export function setConfig(path: string, val: string) {
    console.log(config);
    const splitPath = path.split('.').reverse()

    var ref = config;
    while (splitPath.length > 1) {
        let key = splitPath.pop();
        if (key) {
            if (!ref[key])
                ref[key] = {};
            ref = ref[key];
        } else {
            return;
        }
    }

    let key = splitPath.pop();
    if (key)
        ref[key] = val
}

export async function updateConfig() {
    console.log("write: ", JSON.stringify(config));

    return fs.writeFile('./config.json', JSON.stringify(config, null, 2));
}