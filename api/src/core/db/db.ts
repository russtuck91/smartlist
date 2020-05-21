import mongoist from 'mongoist';

export const db = mongoist(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartlist');
