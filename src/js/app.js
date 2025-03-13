import { CardValidator } from "./CardValidator";
import { DOMHandler } from "./DOMHandler";

document.addEventListener("DOMContentLoaded", () => {
  const validator = new CardValidator();
  const dom = new DOMHandler(validator);

  dom.initialize();
});
