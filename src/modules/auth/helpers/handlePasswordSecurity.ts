import { createCipheriv, createDecipheriv, scrypt } from 'crypto';
import { promisify } from 'util';
import { Buffer } from 'buffer';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';

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

export const handlePasswordEncryption = async (value: string) => {
  const saltOrRounds = 10;
  value = await hash(value, saltOrRounds);

  const { encryptionAlgorithm, key, iv } = await config();
  const cipher = createCipheriv(encryptionAlgorithm, key, iv);

  return Buffer.concat([cipher.update(value), cipher.final()]).toString();
};

export const handlePasswordDecryption = async (value: string) => {
  const { encryptionAlgorithm, key, iv } = await config();

  const decipher = createDecipheriv(encryptionAlgorithm, key, iv);
  const encryptedBuffer = Buffer.from(value, 'hex');

  return Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]).toString();
};
