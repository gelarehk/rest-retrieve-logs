import { expect } from 'chai';
import sinon from 'sinon';
import path from 'path';
import {fileURLToPath} from 'url';
import ReverseFileReader from '../lib/ReverseFileReader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ReverseFileReader', () => {
  let resMock;

  beforeEach(() => {
    resMock = {
      write: sinon.spy(),
      end: sinon.spy(),
      status: sinon.stub().returns({
        send: sinon.spy(),
      }),
    };
  });

  it('should stream file content in reverse order', (done) => {
    const filePath = path.resolve(__dirname, './test.log');

    const reverseFileReader = new ReverseFileReader(filePath);
    reverseFileReader.streamFileInReverse(resMock);

    setTimeout(() => {
      expect(resMock.write.getCalls()[0].firstArg).to.be.equal('line3\n')
      expect(resMock.write.getCalls()[1].firstArg).to.be.equal('line2\n')
      expect(resMock.write.getCalls()[2].firstArg).to.be.equal('line1\n')
      expect(resMock.end.called).to.be.true;
      done();
    }, 100);
  });


  it('should handle file stat errors', (done) => {
    const filePath = 'path/to/nonexistent/file.txt';

    const reverseFileReader = new ReverseFileReader(filePath);
    reverseFileReader.streamFileInReverse(resMock);

    setTimeout(() => {
      expect(resMock.status.calledWith(500)).to.be.true;
      expect(resMock.status().send.calledWith('Error reading file')).to.be.true;
      done();
    }, 100);
  });
});

