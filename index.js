import path from 'path';
import express from 'express';
import pino from 'pino';
import  ReverseFileReader  from './lib/ReverseFileReader.js';

const app = express();
const logger = pino();
const PORT = 3000
const LOG_DIR = process.env.LOG_DIR || "/var/log"

console.log(LOG_DIR)

const CHUNK_SIZE = 16 * 1024; // 16KB
// default number of lines that we return in /logs api
const DEFAULT_COUNT = 10;
const MAX_COUNT = 1000000; // Is it enough?
const MIN_COUNT = 5;

app.get('/healthcheck', (_, res) => {
  // TODO:
  res.send('ok')
})

app.get('/logs', (req, res) => {
  // this file path from /var/log dir. full path will be: /var/log/${filepath}
  const filepath = req.query.f 
  const search = req.query.s
  const c = req.query.c

  if (typeof(filepath) !== 'string') {
    const err = `"f" should be defined`
    logger.error(err);
    return res.status(500).send(err);
  }

  let count = parseInt(c)
  if (isNaN(count)) {
    count = DEFAULT_COUNT
  }

  if (count > MAX_COUNT || count < MIN_COUNT) {
    const err = `Error count should be between ${MIN_COUNT} and ${MAX_COUNT}`
    logger.error(err);
    return res.status(500).send(err);
  }

  const fullFilePath = path.resolve(LOG_DIR, filepath);
  // prevent path traversal attack
  if (!fullFilePath.startsWith(path.resolve(LOG_DIR))) {
    return res.status(403).send('Error forbidden path access');
  }

  const reverseFileReader = new ReverseFileReader(fullFilePath, CHUNK_SIZE);

  // makeing sure we don't waste resources on canceled requests
  req.once('error', (err) => {
    reverseFileReader.cancel();
    logger.info("request canceled")
  });

  reverseFileReader.streamFileInReverse(res, count, search);
})


const server = app.listen(PORT);
console.log(`listening on port ${PORT}`)

process.on('SIGINT', () => {
  logger.info('SIGINTI signal received: closing HTTP server')
  server.close(() => { logger.info('HTTP server closed') })
})

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server')
  server.close(() => { logger.info('HTTP server closed') })
})
