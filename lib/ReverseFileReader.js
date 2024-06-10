import fs from 'fs';
import pino from 'pino';
const logger = pino();

class ReverseFileReader {
  constructor(filePath, chunkSize = 64 * 1024) {
    this.filePath = filePath;
    this.chunkSize = chunkSize;
    this.buffer = '';
    this.isFirstLine = true;
    this.cancelP = false;
  }

  streamFileInReverse(res, count = 10, search = '') {
    fs.stat(this.filePath, (err, stats) => {
      if (err) {
        logger.error(err);
        return res.status(500).send('Error reading file');
      }

      this.count = count;

      if (search) {
        // TODO: improve the regex
        const regexToMatch = `${search}`
        this.re = new RegExp(regexToMatch, 'i');
      }

      this.fileSize = stats.size;
      this.position = this.fileSize;
      this.readChunk(res);

    });
  }

  cancel() {
    this.cancelP = true;
  }

  readChunk(res) {
    const start = Math.max(0, this.position - this.chunkSize);
    const length = this.position - start;
    const bufferChunk = Buffer.alloc(length);
    let firstLine = true;

    fs.open(this.filePath, 'r', (err, fd) => {
      if (err) {
        logger.error(err);
        return res.status(500).send('Error opening file');
      }

      fs.read(fd, bufferChunk, 0, length, start, (err, _) => {
        if (err) {
          logger.error(err);
          return res.status(500).send('Error reading file');
        }

        if (this.cancelP) {
          res.end()
          fs.close(fd)
          return
        }

        this.buffer = bufferChunk.toString('utf8') + this.buffer;
        this.position = start;
        let lines = this.buffer.split('\n');

        if (this.position > 0) {
          this.buffer = lines.shift(); // save the first incomplete line for the next chunk
        } 

        for (let i = lines.length - 1; i >= 0; i--) {
          if (this.cancelP) {
            res.end()
            fs.close(fd)
            return
          }

          const line = lines[i]

          // ignore first empty line
          // TOTO: this can be handled better?!
          if (firstLine && line == '' ) {
            firstLine = false
            continue
          }

          // ignore the line if regix exists and not match
          if (this.re && this.re.test(line) === false) {
            continue
          }

          res.write(line + '\n')

          this.count--
          if (this.count <= 0) {
            res.end()
            fs.close(fd)
            return
          }
        }

        fs.close(fd, () => {
          if (this.position > 0) {
            this.readChunk(res);
          } else {
            res.end();
          }
        });
      });
    });
  }
}

export default ReverseFileReader;
