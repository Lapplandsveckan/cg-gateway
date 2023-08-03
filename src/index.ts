import config, { loadConfig } from './util/config';
import {Logger} from './util/log';

async function start() {
    Logger.info('Starting Caspar CG Gateway...');
    await loadConfig();

    Logger.info('Gateway started!');

    if (process.env.NODE_ENV !== 'production') {
        // Development mode, reveal functions for debugging
    }

    return () => {
        Logger.info('Stopping gateway...');

        // Shutdown code

        Logger.info('Gateway stopped!');

        process.exit(0);
    };
}

export function stop() {
    if (stopHandler) stopHandler();
}

let stopHandler: () => void;
async function main() {
    try {
        const stop = await start();
        stopHandler = stop;

        process.on('SIGINT', stop);
        process.on('SIGTERM', stop);
    } catch (e) {
        Logger.error(e);
        process.exit(1);
    }
}

if (require.main === module) main();