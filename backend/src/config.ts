import 'dotenv/config';

type TCorsOrigin = string | undefined;
type TCorsCallback = { (error: Error | null, allowAccess: boolean): void };

const whitelist = [process.env.ORIGIN_ALLOW || 'http://localhost:5173'];
const corsOptions = {
  origin: function(origin: TCorsOrigin, callback: TCorsCallback){
    if(typeof origin === 'string' && whitelist.includes(origin) || !origin) callback(null, true)
    else callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
};

export default {
  port: parseInt(process.env.PORT ?? '', 10) || 3000,
  mongoUrl: process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek',
  corsOptions,
  uploadDir: process.env.UPLOAD_PATH || 'images',
  tempUploadDir: process.env.UPLOAD_PATH_TEMP || 'temp',
  refreshTokenExpiry: process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d',
  accessTokenExpiry: process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m',
  jwtSecret: process.env.AUTH_SECRET_KEY || 'some-secret-key'
};
