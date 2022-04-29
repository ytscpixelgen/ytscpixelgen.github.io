export class Color {
  readonly color: string;
  constructor({ color }: { color: string; }) {
    let block;
    switch (color) {
      case "red":
        block = "🟥";
        break;
      case "orange":
        block = "🟧";
        break;
      case "yellow":
        block = "🟨";
        break;
      case "green":
        block = "🟩";
        break;
      case "blue":
        block = "🟦";
        break;
      case "violet":
        block = "🟪";
        break;
      case "brown":
        block = "🟫";
        break;
      case "black":
        block = "⬛";
        break;
      case "white":
        block = "⬜";
        break;
      default:
        block = "⬜";
    }
    this.color = block;
  }
}