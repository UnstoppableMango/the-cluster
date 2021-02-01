import fetch from 'node-fetch';
import * as fs from 'fs';

export const download = async (url: string, dest: string): Promise<void> => {
  const res = await fetch(url);
  const fileStream = fs.createWriteStream(dest);

  await new Promise((resolve, reject) => {
    res.body?.pipe(fileStream);
    res.body?.on('error', reject);
    fileStream.on('finish', resolve);
  });
};
