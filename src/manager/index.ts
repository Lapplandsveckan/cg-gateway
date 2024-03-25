import {Logger} from '../util/log';
import {MediaScanner} from './scanner';
import {CasparProcess} from './caspar/process';
import {EventEmitter} from 'events';
import {CasparExecutor} from './caspar/executor';
import {PluginManager} from './amcp/plugin';
import {CGServer} from '../api/server';
import {DirectoryManager} from './scanner/dir';
import {FileDatabase} from './scanner/db';
import {UIInjector} from './amcp/ui';
import {EffectRegistry} from '@lappis/cg-manager';

export class CasparManager extends EventEmitter {
    public scanner: MediaScanner;
    public caspar: CasparProcess;
    public executor: CasparExecutor;
    public effects: EffectRegistry;
    public plugins: PluginManager;
    public server: CGServer;
    public ui: UIInjector;
    public get db() {
        return FileDatabase.db;
    }

    private static instance: CasparManager;
    public static getManager() {
        if (!CasparManager.instance) CasparManager.instance = new CasparManager();
        return CasparManager.instance;
    }

    private constructor() {
        super();

        this.scanner = new MediaScanner();
        this.caspar = new CasparProcess();
        this.effects = new EffectRegistry();
        this.executor = new CasparExecutor();
        this.plugins = new PluginManager();
        this.ui = new UIInjector();

        this.caspar.on('status', (status) => this.emit('caspar-status', status));
        this.caspar.on('status', (status) => status.running ? setTimeout(() => this.executor.connect(), 500) : setTimeout(() => this.executor.disconnect(), 500));
        this.caspar.on('log', (log) => this.emit('caspar-logs', log));
    }

    async start() {
        Logger.info('Starting media scanner...');
        await this.scanner.start();

        FileDatabase.db.on('change', (key, value) => this.emit('media', key, value));

        Logger.info('Starting Caspar CG process...');
        await this.caspar.start();

        for (let i = 0; i < this.caspar.config.channels.length; i++)
            this.executor.allocateChannel(i + 1);
    }

    async stop() {
        await this.scanner.stop();
        await this.caspar.stop();

        this.scanner = null;
        this.caspar = null;

        // TODO: fix this
        // this.executor.deallocateAllChannels();
    }

    public getMediaScanner() {
        return this.scanner;
    }

    public getCasparProcess() {
        return this.caspar;
    }

    public getExecutor() {
        return this.executor;
    }

    public get directory() {
        return DirectoryManager.getManager();
    }

    public getPlugins() {
        return this.plugins;
    }

    public getFiles() {
        return this.db;
    }

    public getPluginInjections() {
        return this.ui.getInjections();
    }

    public getPluginInjectionCode(id: string) {
        return this.ui.bundle(id);
    }

    public getLogger(scope: string) {
        return Logger.scope(scope);
    }
}