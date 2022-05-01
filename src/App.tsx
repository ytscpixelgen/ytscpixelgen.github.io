import React from 'react';
import { useEffect, useState, useRef } from "react";
// import logo from './logo.svg';
import './App.css';
import useFontFaceObserver from 'use-font-face-observer';
import Alphabet from './class/alphabet';
import ColorBlock from './class/color_block';
import { Color } from './class/color';
import { useForm } from "react-hook-form";
import { InputText } from './type/input';
import { reshape2D } from './func/reshape';
import SC from './class/sc';
import width22 from './asset/width22.png';
import width18 from './asset/width18.png';
declare global {
  interface Array<T> {
    reshape(rows: number, cols: number): Array<Array<T>>;
  }
}
function App() {
  // ABCDEFGHIJKLMNOPQRSTUVWXYZ
  let [minWidth, maxWidth] = [15, 30];
  let [engHeight, chiHeight] = [5, 10];
  let pixelThreshold = 200;
  let heightZoomRatio = 1.2;
  let defaultLength = 18;
  let regexRule = /[0-9A-Z/!/?/+/-]+/g
  const [maxLength, setMaxLength] = useState<number>(defaultLength);
  const [includeSpace, setIncludeSpace] = useState<boolean>(true);
  const [align, setAlign] = useState<string>("left");
  const [mode, setMode] = useState<string>("eng");
  const [bgColor, setBgColor] = useState<Color>({ color: "⬜" });
  const [fgColor, setFgColor] = useState<Color>({ color: "⬛" });
  const [inputText, setInputText] = useState<string>("YUU");
  const [outputBlock, setOutPutBlock] = useState<string[]>([]);
  const [outputText, setOutputText] = useState<string>("");
  const [outputLength, setOutputLength] = useState<number>(0);
  const [outputAmount, setOutputAmount] = useState<number | string>(0);
  const { register, handleSubmit } = useForm<InputText>({ shouldUseNativeValidation: true });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [textToPixel, setTextToPixel] = useState<number[][]>([[]]);
  const isFontListLoaded  = useFontFaceObserver([
    {
      family: `PixelFont`
    },
  ]);

  const createCharDisplay = () => {
    let charDisplay = [];
    const h = mode === "chi" ? chiHeight : engHeight;
    for (let i = 0; i < h; i++) {
      charDisplay.push(<div key={i}>{outputBlock[i]}</div>);
    }
    return charDisplay;
  };

  const popLeftPushRight = function (input: number[][]) {
    const copy = input.slice(0);
    copy.shift();
    copy.push(Array(copy[0].length).fill(0));
    return copy;

  };
  const textToCanvaArray = function () {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (isFontListLoaded){ 
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.font = `${canvas.height}px PixelFont`;
          ctx.textBaseline = "top";
          ctx.fillStyle = "#FFFFFF";
          // ctx.canvas.style.letterSpacing = '1px'
          let x = 0;
          switch (align) {
            case "right":
              x = canvas.width;
              ctx.textAlign = 'right';
              ctx.fillText(inputText, x, 0);
              break;
            case "center":
              x = canvas.width / 2;
              ctx.textAlign = 'center';
              ctx.fillText(inputText, x, 0);
              break;
            case "left":
            default:
              x = 0;
              ctx.textAlign = 'left';
              ctx.fillText(inputText, x, 0);
          }
          let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          let singleChannel = data.filter((v: any, index: number) => index % 4 === 3).map((val: any) => { return (val > pixelThreshold) ? 1 : 0; });
          let reshaped = reshape2D(singleChannel, canvas.height, canvas.width);
          let modified = popLeftPushRight(reshaped);
          setTextToPixel(modified);
        }
      }
    }
  };

  const arrayToPixelv1 = function (input: string) {
    let charDisplay = [];
    const h = mode === "chi" ? chiHeight : engHeight;
    const alphabetZip = Alphabet.alphabetZip;
    for (let i = 0; i < h; i++) {
      let charLine: any[] = [];
      let fillText = "";
      if (mode === "eng") {
        input.split("").forEach(function (item, index) {
          let charArray: String[] = [];
          alphabetZip[item][i].forEach(function (bit, index) {
            let colorBlock = bit.toString();
            charArray.push(colorBlock);
          });
          charLine.push(charArray.join(''));
        });
        let text = includeSpace ? charLine.join('0') : charLine.join('');
        let currentLength = text.length;
        let remainLength = Math.max(maxLength - currentLength, 0);
        let fullText = "";
        switch (align) {
          case "right":
            fullText = ('0'.repeat(remainLength) + text);
            fillText = fullText.substring(Math.max(fullText.length - maxLength, 0), fullText.length);
            break;
          case "center":
            let leftPadding = Math.ceil(remainLength / 2);
            let rightPadding = remainLength - leftPadding;
            fullText = ('0'.repeat(leftPadding) + text + '0'.repeat(rightPadding));
            let leftStart = Math.floor(Math.max(fullText.length - maxLength, 0) / 2);
            fillText = fullText.substring(leftStart, leftStart + maxLength);
            break;
          case "left":
          default:
            fullText = text + '0'.repeat(remainLength);
            fillText = fullText.substring(0, maxLength);
        }
      } else if (mode === "chi") {
        fillText = textToPixel[i].join('');
      }

      let displayText = fillText.replaceAll('1', fgColor.color).replaceAll('0', bgColor.color);

      charDisplay.push(displayText);
    }
    return charDisplay;
  };

  useEffect(() => {
    let input = "";
    if (mode === "eng") {
      input = inputText.match(regexRule)?.join("") ?? "";
      setOutPutBlock(arrayToPixelv1(input));
    }
    else if (mode === "chi") {
      input = inputText;
      textToCanvaArray();
    }
  }, [inputText, maxLength, includeSpace, bgColor, fgColor, align, mode]);

  useEffect(() => {
    let charDisplay = [];
    if (mode === "chi") {
      const h = mode === "chi" ? chiHeight : engHeight;
      for (let i = 0; i < h; i++) {
        let fillText = "";
        let oparray = textToPixel;
        fillText = oparray[i].join('');

        let displayText = fillText.replaceAll('1', fgColor.color).replaceAll('0', bgColor.color);

        charDisplay.push(displayText);
      }
      setOutPutBlock(charDisplay);
    }
  }, [textToPixel]);

  const range = (start: number, stop: number, step: number) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step));
  const selectWidthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(event.target.value);
    setMaxLength(value);
  };
  const handleSpaceChange = () => {
    setIncludeSpace(!includeSpace);
  };
  const handleAlignChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAlign(event.target.value);
  };
  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode(event.target.value);
  };
  const handleBgColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const bgColor = event.target.value;
    const block = new Color({ color: bgColor });
    setBgColor(block);
  };
  const handleFgColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fgColor = event.target.value;
    const block = new Color({ color: fgColor });
    setFgColor(block);
  };
  const onSubmit = (data: InputText) => {
    let output = outputBlock.join('');
    setOutputText(output);
  };
  const onTestBlockClicked = () => {
    let testBlock = (fgColor.color.repeat(10) + bgColor.color.repeat(10)).repeat(2);
    setOutputText(testBlock);
  };
  useEffect(() => {
    let charCount = 2 * outputText.length - occurenceCount(outputText, "⬜") - occurenceCount(outputText, "⬛");
    setOutputLength(charCount);
    setOutputAmount(SC.getLoc(charCount));
  }, [outputText]);
  const occurenceCount = (mainString: string, subString: string) => {
    return mainString.split(subString).length - 1;
  };

  return (
    <div className="App">
      <div>
        <canvas hidden ref={canvasRef}
          height={chiHeight * heightZoomRatio}
          width={maxLength}
          className="useFont" />
      </div>
      <div className="displayBlock">
        {createCharDisplay()}
      </div>
      <div className="main">
        <form className='form' onSubmit={handleSubmit(onSubmit)}>
          <input
            type='text'
            value={inputText}
            {...register('inputText', {
              onChange: (event) => setInputText(event.target.value.toUpperCase())
            })}
          />
          <button type="submit">生成圖案</button>
          <button type="button" onClick={onTestBlockClicked}>  生成測試圖案 </button>
        </form>
        <div key="setmode">
          <>
            對齊：
            <label> 英文({engHeight}格高)，較便宜
              <input
                type="radio"
                name="mode"
                value="eng"
                defaultChecked
                onChange={handleModeChange}
              />
            </label>
            <label> 中文({chiHeight}格高)，較貴
              <input
                type="radio"
                name="mode"
                value="chi"
                onChange={handleModeChange}
              />
            </label>
          </>
        </div>
        <div className='reference'>
          (英文模式只有大階、數字及!?；中文模式因寬度限制及洗版問題，建議吹水台才使用)
        </div>
        <div>
          Chatroom寬度  &nbsp;
          <select
            defaultValue={maxLength}
            onChange={selectWidthChange}
            className="browser-default custom-select">

            {range(minWidth, maxWidth, 1).map((value, index) => <option value={value} key={value}>{value}</option>)}

          </select>
        </div>
        <div className="reference">
          (參考：遊戲台時寬度18，吹水台時寬度22)</div>
        <label>
          包含空格&nbsp;
          <input
            type="checkbox"
            checked={includeSpace}
            onChange={handleSpaceChange}
            disabled={mode === "chi"}
          />
        </label>
        <div key="setalign">
          <>
            對齊：
            <label> 置左
              <input
                type="radio"
                name="alignment"
                value="left"
                defaultChecked
                disabled={mode === "chi"}
                onChange={handleAlignChange}
              />
            </label>
            <label> 置中
              <input
                type="radio"
                name="alignment"
                value="center"
                disabled={mode === "chi"}
                onChange={handleAlignChange}
              />
            </label>
            <label> 置右
              <input
                type="radio"
                name="alignment"
                value="right"
                disabled={mode === "chi"}
                onChange={handleAlignChange}
              />
            </label>
          </>
        </div>
        <div className='reference'>
          (中文模式不支援空格及對齊)
        </div>
        <div key="div-fg">
          <>
            字體顏色：
            {Object.entries(ColorBlock.block).map(function ([key, value]) {
              return (
                <label key={"fg-label" + key}>
                  {value}
                  <input
                    type="radio"
                    name="fgColor"
                    key={"fg" + key}
                    value={key}
                    checked={fgColor.color === value}
                    onChange={handleFgColorChange}
                  />
                </label>
              );
            })}
          </>
        </div>
        <div key="div-bg">
          <>
            背景顏色：
            {Object.entries(ColorBlock.block).map(function ([key, value]) {
              return (
                <label key={"bg-label" + key}>
                  {value}
                  <input
                    type="radio"
                    name="bgColor"
                    key={"bg" + key}
                    value={key}
                    checked={bgColor.color === value}
                    onChange={handleBgColorChange}
                  />
                </label>
              );
            })}
          </>
        </div>
        <textarea value={outputText} readOnly></textarea>
        <div>最低字數 = {outputLength}</div>
        <div>最低金額 = ${outputAmount} HKD</div>
      </div>
      <div className='reference'>
        要成功發送Superchat，需要在貼上圖案後加上中文字句。<br />否則會出現「無法傳送訊息。請編輯訊息後再試一次。」
      </div>
      <div className='example'>
        <div className='row'>
          <div className='column'>
            <div>
              <div><img src={width22} alt="width22" className='image' /></div>
              <div>成功例子(所需寬度=22，圖案寬度=22)</div>
            </div>
          </div>
          <div className='column'>
            <div>
              <div><img src={width18} alt="width18" className='image' /></div>
              <div>失敗例子(所需寬度=18，圖案寬度=22)</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

export default App;
