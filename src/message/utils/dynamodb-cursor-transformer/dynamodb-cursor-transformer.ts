export function encodeCursor(key: Record<string, any>): string {
  return Buffer.from(JSON.stringify(key)).toString('base64');
}

export function decodeCursor(cursor: string): Record<string, any> {
  return JSON.parse(Buffer.from(cursor, 'base64').toString());
}
