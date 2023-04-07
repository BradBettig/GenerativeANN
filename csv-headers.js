import { createReadStream, createWriteStream, promises as fs } from 'fs';
import { createInterface } from 'readline';

const generateHeaders = (n) => {
    const columns = [];
  
    for (let i = 0; i < n; i++) {
      columns.push(`a${i}`);
    }
  
    return `letter,${columns.join(',')}`;
  };

const addHeadersToCSV = async (inputFile, outputFile) => {
    try {
      const inputStream = createReadStream(inputFile, 'utf8');
      const outputStream = createWriteStream(outputFile, 'utf8');
      const rl = createInterface({ input: inputStream });
  
      // Write the headers to the output file
      const headers = generateHeaders(784);
      outputStream.write(`${headers}\n`);
  
      // Process the input file line by line
      rl.on('line', (line) => {
        outputStream.write(`${line}\n`);
      });
  
      rl.on('close', () => {
        outputStream.end();
        console.log('Headers successfully added to', outputFile);
      });
    } catch (err) {
      console.error('Error:', err);
    }
  };

  addHeadersToCSV('A_ZHandwrittenData.csv', 'HeaderToData.csv');