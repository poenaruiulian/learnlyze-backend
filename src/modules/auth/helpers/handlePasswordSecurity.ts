import { createCipheriv, createDecipheriv, scrypt } from 'crypto';
import { promisify } from 'util';
import { Buffer } from 'buffer';
import { ConfigService } from '@nestjs/config';

const config = async () => {
  const configService = new ConfigService();

  const iv = Buffer.from('00000000000000000000000000000000', 'hex');

  const keyGeneratingPassword =
    configService.get<string>('PASSWORD_FOR_HASHING') ?? '';

  const encryptionAlgorithm =
    configService.get<string>('ENCRYPTION_ALGORITHM') ?? '';

  const key = (await promisify(scrypt)(
    keyGeneratingPassword,
    'salt',
    32,
  )) as Buffer;

  return {
    iv,
    keyGeneratingPassword,
    encryptionAlgorithm,
    key,
  };
};

export const handlePasswordEncryption = async (
  value: string,
): Promise<string> => {
  const { encryptionAlgorithm, key, iv } = await config();
  const cipher = createCipheriv(encryptionAlgorithm, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ]);
  return encrypted.toString('hex');
};

export const handlePasswordDecryption = async (
  value: string,
): Promise<string> => {
  try {
    const { encryptionAlgorithm, key, iv } = await config();

    const decipher = createDecipheriv(encryptionAlgorithm, key, iv);
    const encryptedBuffer = Buffer.from(value, 'hex');

    const decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error('Failed to decrypt the password: ' + error.message);
  }
};
