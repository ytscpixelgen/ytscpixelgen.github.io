import React from 'react';
import { useEffect, useState } from "react";
// import logo from './logo.svg';
import './App.css';
import Alphabet from './class/alphabet';
import ColorBlock from './class/color_block';
import { Color } from './class/color';
import { useForm } from "react-hook-form";
import { InputText } from './type/input';
import { bisect } from './func/bisect';
import SC from './class/sc';
import width22 from './asset/width22.png'
import width18 from './asset/width18.png'
function App() {
  // ABCDEFGHIJKLMNOPQRSTUVWXYZ
  let [minWidth, maxWidth] = [15, 30];  
  const [maxLength, setMaxLength] = useState<number>(18);
  const [includeSpace, setIncludeSpace] = useState<boolean>(true);
  const [align, setAlign] = useState<string>("left");
  const [bgColor, setBgColor] = useState<Color>({ color: "⬜" });
  const [fgColor, setFgColor] = useState<Color>({ color: "⬛" });
  const [inputText, setInputText] = useState<string>("YUU");
  const [outputBlock, setOutPutBlock] = useState<string[]>([]);
  const [outputText, setOutputText] = useState<string>("");
  const [outputLength, setOutputLength] = useState<number>(0);
  const [outputAmount, setOutputAmount] = useState<number | string>(0);
  const { register, handleSubmit } = useForm<InputText>({ shouldUseNativeValidation: true });
  // const [charDisplay, setCharDisplay] = useState<string[]>();
  // let charDisplay: any[] = [];
  const createCharDisplay = () => {
    let charDisplay = [];
    for (let i = 0; i < 5; i++) {
      charDisplay.push(<div key={i}>{outputBlock[i]}</div>);
    }
    return charDisplay;
  };

  useEffect(() => {
    const alphabetZip = Alphabet.alphabetZip;
    let input = inputText.match(/[A-Z/!/?]+/g)?.join("") ?? "";
    // console.log(input.split("").filter(char=>match(char)))
    let charDisplay = [];
    for (let i = 0; i < 5; i++) {
      let charLine: any[] = [];
      input.split("").forEach(function (item, index) {
        let charArray: String[] = [];
        alphabetZip[item][i].forEach(function (bit, index) {
          // let colorBlock = bit === 1 ? '⬛' : '⬜';
          let colorBlock = bit.toString();
          // let colorBlock = bit;
          charArray.push(colorBlock);
        });
        charLine.push(charArray.join(''));
      });
      let text = includeSpace ? charLine.join('0') : charLine.join('');
      let currentLength = text.length;
      let remainLength = Math.max(maxLength - currentLength, 0);
      let fillText = "";
      let fullText = "";
      // Math.floor
      switch (align) {
        case "right":
          // console.log(remainLength)
          fullText = ('0'.repeat(remainLength) + text);
          fillText = fullText.substring(Math.max(fullText.length - maxLength, 0), fullText.length);
          break;
        case "center":
          let leftPadding = Math.ceil(remainLength / 2);
          let rightPadding = remainLength - leftPadding;
          fullText = ('0'.repeat(leftPadding) + text + '0'.repeat(rightPadding));
          let leftStart = Math.floor(Math.max(fullText.length - maxLength, 0) / 2);
          console.log(fullText.length, leftStart);
          fillText = fullText.substring(leftStart, leftStart + maxLength);
          break;
        case "left":
        default:
          fullText = text + '0'.repeat(remainLength);
          fillText = fullText.substring(0, maxLength);
      }

      let displayText = fillText.replaceAll('1', fgColor.color).replaceAll('0', bgColor.color);
      charDisplay.push(displayText);
    }
    setOutPutBlock(charDisplay);
    // console.log(outputBlock)
  }, [inputText, maxLength, includeSpace, bgColor, fgColor, align]);

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
    // console.log(testBlock);
  };
  useEffect(() => {
    console.log(outputText);
    let charCount = 2 * outputText.length - occurenceCount(outputText, "⬜") - occurenceCount(outputText, "⬛");
    setOutputLength(charCount);
    let loc = bisect(SC.SCWordCount, charCount);
    if (loc === SC.SCPrice.length) {
      setOutputAmount("Message is being too long");
    }
    else {
      setOutputAmount(SC.SCPrice[loc]);
    }
  }, [outputText]);
  const occurenceCount = (mainString: string, subString: string) => {
    return mainString.split(subString).length - 1;
  };

  return (
    <div className="App">
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
        <div className='reference'>
            (暫時只支援大階A-Z及!?)
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
                onChange={handleAlignChange}
              />
            </label>
            <label> 置中
              <input
                type="radio"
                name="alignment"
                value="center"
                onChange={handleAlignChange}
              />
            </label>
            <label> 置右
              <input
                type="radio"
                name="alignment"
                value="right"
                onChange={handleAlignChange}
              />
            </label>
          </>
        </div>
        <div key="div-fg">
          <>
            字體顏色：
            {Object.entries(ColorBlock.block).map(function ([key, value]) {
              // console.log(value);
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
              // console.log(value);
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
              <div><img src={width22} alt="width22" className='image'/></div>
        <div>成功例子(所需寬度=22，圖案寬度=22)</div>
      </div>
    </div>
    <div className='column'>
      <div>
              <div><img src={width18} alt="width18" className='image'/></div>
        <div>失敗例子(所需寬度=18，圖案寬度=22)</div>
      </div>
    </div>
  </div>
</div>

    </div>
    
  );
}

export default App;
