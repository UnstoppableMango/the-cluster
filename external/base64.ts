export const encode = (str: string): string => Buffer.from(str, 'binary').toString('base64');
