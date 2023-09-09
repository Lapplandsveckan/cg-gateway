import config, { loadConfig } from './util/config';
import {Logger} from './util/log';
import {CGServer} from './api/server';
import {Discovery} from './manager/discovery';
import {MediaScanner} from './manager/scanner';
import {CasparProcess} from './manager/caspar/process';

let casparPath = '/home/simme/caspar/server/casparcg_server/';
Logger.debug('Debug mode enabled!');



async function start() {
    Logger.info('Starting Caspar CG Gateway...');
    await loadConfig();

    Logger.info('Starting media scanner...');
    const scanner = new MediaScanner();
    await scanner.start();

    Logger.info('Starting Caspar CG process...');
    const caspar = new CasparProcess();
    await caspar.start(casparPath);

    Logger.info('Starting incoming handler...');

    const server = new CGServer(manager, config.port);
    await server.start();

    Logger.info('Starting bonjour discovery service...');

    const discovery = new Discovery();
    await discovery.start();

    Logger.info('Gateway started!');

    return async () => {
        Logger.info('Stopping gateway...');

        await discovery.stop();
        await server.stop();
        await manager.stop();

        Logger.info('Gateway stopped!');

        process.exit(0);
    };
}

export function stop() {
    if (stopHandler) stopHandler();
}

let stopHandler: () => Promise<void> | void;
async function main() {
    try {
        const stop = await start();
        stopHandler = stop;

        const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
        signals.forEach((signal) => {
            process.on(signal, () => {
                stop();
                return false;
            });
        });
    } catch (e) {
        Logger.error(e);
        process.exit(1);
    }
}

//if (require.main === module) main();
main();