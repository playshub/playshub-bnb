import { toNano } from '@ton/core';
import { ValidateBy, ValidationOptions, buildMessage } from 'class-validator';

export const IS_TON_NANO = 'isTonNano';

/**
 * Check if the string is an Ton nano cast-able
 * If given value is not a string, then it returns false.
 */
export function isTonNano(value: string): boolean {
  try {
    if (typeof value === 'string') {
      toNano(value);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Check if the string is an Ton address using basic regex. Does not validate address checksums.
 * If given value is not a string, then it returns false.
 */
export function IsTonNano(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_TON_NANO,
      validator: {
        validate: (value): boolean => isTonNano(value),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + '$property must be an Ton nano cast-able',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
