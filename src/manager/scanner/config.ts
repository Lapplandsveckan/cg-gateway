import { Logger } from '../../util/log';
import { promises as fs } from 'fs';
import { Parser } from 'xml2js';
import path from 'path';
import config from '../../util/config';

async function loadCasparConfig() {
    const folder = config['caspar-path'] || process.cwd();
    const data = await fs.readFile(path.join(folder, 'casparcg.config'))
        .catch(() => Logger.scope('Scanner').error('Failed to read casparcg.config'));

    if (!data) return;

    const parser = new Parser();
    parser.parseString(data, (err, result) => {
        if (err) return Logger.scope('Scanner').error('Failed to parse casparcg.config');

        for (const path in result.configuration.paths[0]) {
            const name = path.split('-')[0];
            Config.paths[name] = result.configuration.paths[0][path][0];
        }
    });
}

const Config = {
    paths: {
        template: './template',
        media: './media',
        font: './font',
    },
    http: {
        port: 8000,
    },
};

loadCasparConfig();

export default Config;