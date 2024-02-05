export function b64e(value: string): string {
  return Buffer.from(value).toString('base64');
}
