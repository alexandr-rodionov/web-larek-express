import path from 'path';
import fs from 'fs/promises';
import cron from 'node-cron';
import config from '../config';

const { tempUploadDir } = config;

export const clearOldFiles = async () => {
  const tempDir = path.join(__dirname, '..', tempUploadDir);
  const files = await fs.readdir(tempDir);

  for (const file of files) {
    const fullPath = path.join(tempDir, file);
    const stats = await fs.stat(fullPath);

    if ((Date.now() - stats.birthtimeMs) > 24 * 60 * 60 * 1000) {
      await fs.unlink(fullPath);
    }
  }
}

cron.schedule('* */24 * * *', () => {
  clearOldFiles().catch(console.error);
});