import { PhoneNumberUtil } from 'google-libphonenumber';
const phoneUtil = PhoneNumberUtil.getInstance();

export const isValidPhone = (phone: string) => {
  const parsedPhoneObj = phoneUtil.parse(phone);
  return phoneUtil.isValidNumber(parsedPhoneObj);
};

export const getTenDigitPhoneNumber = (phone: string): string => {
  const parsedPhoneObj = phoneUtil.parse(phone);
  return String(parsedPhoneObj.getNationalNumber());
};
