import { getTenDigitPhoneNumber, isValidPhone } from './user.util';

describe('User util', () => {
  describe('isValidEmail', () => {
    it('returns true if valid phone number', () => {
      const phone = '+918686868686';
      expect(isValidPhone(phone)).toBeTruthy();
    });

    it('throws error if invalid phone number', () => {
      const phone = '4938';
      expect(() => isValidPhone(phone)).toThrowError();
    });
  });

  describe('getTenDigitPhoneNumber', () => {
    it('throws error if invalid phone number', () => {
      const phone = '435978';
      expect(() => getTenDigitPhoneNumber(phone)).toThrowError();
    });

    it('returns ten digit number for valid number', () => {
      const phone = '+918686868686';
      expect(getTenDigitPhoneNumber(phone)).toEqual('8686868686');
    });
  });
});
