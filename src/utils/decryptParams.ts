import {createHash, createDecipheriv} from 'crypto';

const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export function decryptParams(blob: string, secret: string): Record<string, string> | null {
    try {
        const key = createHash('sha256').update(secret).digest();
        const data = Buffer.from(blob, 'base64url');

        const iv = data.subarray(0, IV_LENGTH);
        const tag = data.subarray(data.length - TAG_LENGTH);
        const ciphertext = data.subarray(IV_LENGTH, data.length - TAG_LENGTH);

        const decipher = createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);

        const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        return JSON.parse(plaintext.toString('utf8'));
    } catch {
        return null;
    }
}
