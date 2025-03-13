import { CardValidator } from "../CardValidator";

describe("CardValidator", () => {
  let validator;

  beforeEach(() => {
    validator = new CardValidator();
  });

  describe("getCardType", () => {
    const testCases = [
      ["4111111111111111", "visa"],
      ["5111111111111111", "mastercard"],
      ["2200123456789012", "mir"],
      ["371449635398431", "amex"],
      ["6011111111111117", "discover"],
      ["3530111333300000", "jcb"],
      ["1234567812345678", null],
    ];

    test.each(testCases)("номер %s должен вернуть %s", (number, expected) => {
      expect(validator.getCardType(number)).toBe(expected);
    });
  });

  describe("isValidLuhn", () => {
    test("валидный номер", () => {
      expect(validator.isValidLuhn("4111111111111111")).toBe(true);
    });

    test("невалидный номер", () => {
      expect(validator.isValidLuhn("4111111111111112")).toBe(false);
    });

    test("короткий номер", () => {
      expect(validator.isValidLuhn("4111")).toBe(false);
    });
  });

  describe("validate", () => {
    test("успешная валидация Visa", () => {
      const result = validator.validate("4111 1111 1111 1111");
      expect(result).toEqual({ valid: true, type: "visa" });
    });

    test("неизвестная платежная система", () => {
      const result = validator.validate("1234567812345678");
      expect(result).toEqual({
        valid: false,
        error: "Неизвестная платежная система",
      });
    });

    test("некорректная длина", () => {
      const result = validator.validate("4111 1111 1111"); // 12 цифр
      expect(result).toEqual({
        valid: false,
        error: "Некорректная длина номера",
      });
    });

    test("неверный номер карты", () => {
      const result = validator.validate("4111 1111 1111 1112");
      expect(result).toEqual({ valid: false, error: "Неверный номер карты" });
    });
  });
});
