export class DOMHandler {
  constructor(validator) {
    this.validator = validator;
    this.form = document.getElementById("cardForm");
    this.input = document.getElementById("cardNumber");
    this.icons = document.querySelectorAll(".icon");
    this.result = document.getElementById("result");
  }

  initialize() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.input.addEventListener("input", (e) => this.handleInput(e));
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  handleInput(e) {
    this.result.classList.add("hidden");

    const value = e.target.value.replace(/\D/g, "");
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    e.target.value = formatted.trim();

    const type = this.validator.getCardType(value);
    this.updateIcons(type);
  }

  updateIcons(activeType) {
    this.icons.forEach((icon) => {
      icon.classList.toggle("active", icon.dataset.type === activeType);
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const result = this.validator.validate(this.input.value);

    this.result.classList.remove("hidden", "valid", "invalid");

    if (result.valid) {
      this.result.textContent = `Карта ${result.type.toUpperCase()}`;
      this.result.classList.add("valid");
    } else {
      this.result.textContent = `Ошибка: ${result.error}`;
      this.result.classList.add("invalid");
    }
  }
}
