import mongoist from 'mongoist';

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartlist';
export const db = mongoist(MONGODB_URI);
