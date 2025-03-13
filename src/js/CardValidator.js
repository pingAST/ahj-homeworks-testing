export class CardValidator {
  static PAYMENT_SYSTEMS = {
    visa: { pattern: /^4/, lengths: [13, 16, 19] },
    mastercard: {
      pattern: /^(5[1-5]|2(22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[0-1][0-9]|720))/,
      lengths: [16],
    },
    mir: { pattern: /^220[0-4]/, lengths: [16] },
    amex: { pattern: /^3[47]/, lengths: [15] },
    discover: {
      pattern:
        /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5])|64[4-9]|65)/,
      lengths: [16, 19],
    },
    jcb: { pattern: /^35(2[89]|[3-8][0-9])/, lengths: [16, 19] },
  };

  getCardType(number) {
    const cleaned = number.replace(/\D/g, "");
    for (const [type, config] of Object.entries(
      CardValidator.PAYMENT_SYSTEMS,
    )) {
      if (config.pattern.test(cleaned)) {
        return type;
      }
    }
    return null;
  }

  isValidLuhn(number) {
    const digits = number.replace(/\D/g, "").split("").map(Number);
    if (digits.length < 13) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  validate(number) {
    const cleaned = number.replace(/\D/g, "");
    const type = this.getCardType(cleaned);

    if (!type) return { valid: false, error: "Неизвестная платежная система" };

    const expectedLength = CardValidator.PAYMENT_SYSTEMS[type].lengths;
    if (!expectedLength.includes(cleaned.length)) {
      return { valid: false, error: "Некорректная длина номера" };
    }

    if (!this.isValidLuhn(cleaned)) {
      return { valid: false, error: "Неверный номер карты" };
    }

    return { valid: true, type };
  }
}
