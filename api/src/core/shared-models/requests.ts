

export const baseUiUrl = process.env.APP_URL || (process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : '');
export const baseApiUrl = `${process.env.APP_URL || 'http://localhost:5000'}/api`;

