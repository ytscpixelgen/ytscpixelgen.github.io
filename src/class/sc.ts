import { bisect } from "../func/bisect";

class SC { 
  static SCWordCount: Array<number> = [
    50, 150, 200, 225, 250, 270, 290, 310, 330, 350
  ];
  static SCPrice: Array<number> = [
    10, 25, 50, 100, 250, 500, 1000, 1500, 2000, 2500
  ];
  public static getLoc(charCount: number): string{
      let loc = bisect(this.SCWordCount, charCount);
      if (loc === this.SCPrice.length) {
        return "超出上限，可以考慮使用黑白色代替其他顏色"
      }
      else {
        return `$${this.SCPrice[loc]} HKD`
      }
    };
  }

export default SC;