import { Address } from '@ton/core';
import { ValidateBy, ValidationOptions, buildMessage } from 'class-validator';

export const IS_TON_ADDRESS = 'isTonAddress';

/**
 * Check if the string is an Ton address using basic regex. Does not validate address checksums.
 * If given value is not a string, then it returns false.
 */
export function isTonAddress(value: string): boolean {
  return typeof value === 'string' && Address.isFriendly(value);
}

/**
 * Check if the string is an Ton address using basic regex. Does not validate address checksums.
 * If given value is not a string, then it returns false.
 */
export function IsTonAddress(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_TON_ADDRESS,
      validator: {
        validate: (value): boolean => isTonAddress(value),
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must be an Ton address',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
