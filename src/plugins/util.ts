import fs from 'fs';
import path from 'path';
import {noTry} from 'no-try';
import {Logger} from '../util/log';
import {CasparPlugin} from '@lappis/cg-manager';

function loadPluginFolderUnsafe(dir: string) {
    return fs.readdirSync(dir)
        .filter((file) => !file.includes('.'))
        .map((file) => require(path.join(dir, file)).default as typeof CasparPlugin);
}

export function loadPluginFolder(dir: string) {
    const [err, files] = noTry(() => loadPluginFolderUnsafe(dir));
    if (err) {
        if (!err.message.includes('ENOENT')) Logger.error(`Error loading plugins from ${dir}: ${err}`);
        return [];
    }

    return files;
}