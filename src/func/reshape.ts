
  const reshape3D = function (raw: Uint8ClampedArray, rows: number, cols: number, channels: number) {
    const res: number[][][] = [];
    for (var r = 0; r < rows; r++) {
      res[r] = [];
      for (var c = 0; c < cols; c++) {
        res[r][c] = [];
        for (var ch = 0; ch < channels; ch++) {
          res[r][c][ch] = raw[cols * channels * r + channels * c + ch];
        }
      }
    }
    return res;
  };
  const reshape2D = function (raw: Uint8ClampedArray, rows: number, cols: number) {
    const res: number[][] = [];
    for (var r = 0; r < rows; r++) {
      res[r] = [];
      for (var c = 0; c < cols; c++) {
        res[r][c] = raw[cols * r + c];
      }
    }
    return res;
};
  
export { reshape2D, reshape3D};