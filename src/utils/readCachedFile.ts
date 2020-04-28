import fs from 'fs';
import path from 'path';
import got from 'got';
import cheerio from 'cheerio';

import { writeFileAsync } from 'medea';

const ONE_HOUR = 1000 * 60 * 60;
const CACHE_STALE_TIME = ONE_HOUR;

const defaultOptions = {
  cacheDirectory: path.join(__dirname, '../cache'),
  cacheStaleTime: CACHE_STALE_TIME,
  exitOnError: true
};

interface FetchPageOptions {
  cacheDirectory?: string;
  cacheStaleTime?: number | null;
  exitOnError?: boolean;
}

async function fetchPage(
  key: string,
  url: string,
  opts?: {
    cacheDirectory?: string;
    cacheStaleTime?: number | null;
    exitOnError?: true;
  }
): Promise<CheerioStatic>;
async function fetchPage(
  key: string,
  url: string,
  opts: {
    cacheDirectory?: string;
    cacheStaleTime?: number | null;
    exitOnError: false;
  }
): Promise<CheerioStatic | null>;
async function fetchPage(
  key: string,
  url: string,
  opts: FetchPageOptions = defaultOptions
) {
  const cacheDirectory = opts.cacheDirectory ?? defaultOptions.cacheDirectory;
  const cacheStaleTime = opts.cacheStaleTime ?? defaultOptions.cacheStaleTime;
  const exitOnError = opts.exitOnError ?? defaultOptions.exitOnError;

  const noCacheTimeout = opts.cacheStaleTime === null;
  const filename = path.resolve(path.join(cacheDirectory, `${key}.html`));

  try {
    fs.accessSync(filename, fs.constants.R_OK);
    console.log(`Reading ${key} from cache.`);

    const stats = fs.statSync(filename);
    const mtime = new Date(stats.mtime).getTime();

    if (noCacheTimeout || mtime + cacheStaleTime > Date.now()) {
      const data = fs.readFileSync(filename, 'utf-8');
      return cheerio.load(data);
    } else {
      console.log(`Cache for ${key} is stale, will request.`);
    }
  } catch (err) {
    console.error(`Cache for ${key} is empty, will request.`);
  }

  try {
    const response = await got(url);
    const html = response.body;
    await writeFileAsync(filename, html);

    return cheerio.load(html);
  } catch (e) {
    console.log(`Request for ${key} failed.`);

    if (exitOnError) {
      console.error(e);
      process.exit(1);
    } else {
      return null;
    }
  }
}

export default fetchPage;
