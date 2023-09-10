import * as fs from 'fs';
import * as unzipper from 'unzipper';

export const extract = async (file: string, dest: string): Promise<void> => {
  const readStream = fs.createReadStream(file);
  const parseStream = readStream.pipe(unzipper.Extract({ path: dest }));

  await new Promise((resolve, reject) => {
    parseStream.on('close', resolve);
    parseStream.on('error', reject);
  });
};
