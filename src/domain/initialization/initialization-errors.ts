export class DuplicatePoliticalBackgroundError extends Error {
  constructor() {
    super("A political background has already been applied.");
    this.name = "DuplicatePoliticalBackgroundError";
  }
}

export class PoliticalBackgroundMismatchError extends Error {
  constructor() {
    super(
      "The applied political background must match the selected background.",
    );
    this.name = "PoliticalBackgroundMismatchError";
  }
}
