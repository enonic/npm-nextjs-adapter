import {createHash, randomBytes, createCipheriv} from 'crypto';

const IV_LENGTH = 12;

export function encryptParams(params: Record<string, any>, secret: string): string {
    const key = createHash('sha256').update(secret).digest();
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const plaintext = Buffer.from(JSON.stringify(params), 'utf8');

    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([iv, ciphertext, tag]).toString('base64url');
}
