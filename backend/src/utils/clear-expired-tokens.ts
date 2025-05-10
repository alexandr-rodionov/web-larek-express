import cron from 'node-cron';
import { User } from '../models';

export const clearExpiredTokens = async () => {
  await User.updateMany({}, [{
    '$set': {
      tokens: {
        '$filter': {
          input: '$tokens',
          cond: { '$gte': ['$$this.expiresAt', new Date()] }
        }
      }
    }
  }]);
};

cron.schedule('0 0 * * *', () => {
  clearExpiredTokens()
    .then(() => console.log('Cleaned expired tokens'))
    .catch(err => console.error('Error cleaning expired tokens:', err));
});