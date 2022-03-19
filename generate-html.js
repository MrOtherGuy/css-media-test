const fs = require('fs').promises;

function createThing(name,obj,textObject){

  textObject.htmlText += `<div id="media-${name}" class="media-item">\n<h2>${name}</h2>\n<div class="description">${obj.description}`
  if(obj.range && (obj.range.unit || obj.range.fraction)){
    textObject.htmlText += ` (${obj.range.unit})`;
  }
  textObject.htmlText += `</div>\n`;
  // item <div> is open
  if(obj.range){
    
    const isSparse = (obj.range.step > 1) || obj.range.fraction;

    if(isSparse){
      textObject.htmlText += `<pre class="range sparse">\n<div><span>0</span></div>\n`;
    }else{
      textObject.htmlText += `<pre class="range">\n<div>0</div>\n`;
    }
    // range div is open
 
    let maxn = 20;
    const N = Math.floor((obj.range.max - obj.range.min)/obj.range.step) + 1;
    let k = 1;
    let i = obj.range.min;
    const rangeSelector = `#media-${name} > .range`;
    textObject.cssText += `${rangeSelector}{ background-size: ${100/(N+1)}% }\n`;
    const suffix = obj.range.fraction ? `/${obj.range.denominator}` : obj.range.unit;
    textObject.cssText += `@media (max-${name}:${obj.range.min}${suffix}){ ${rangeSelector}{ background-position: 0% } }\n`;
    
    while( maxn > 0 && i <= obj.range.max){
      
      if(isSparse){
        let text = obj.range.fraction ? i + suffix : i; 
        textObject.htmlText += `<div><span>${text}</span></div>\n`;
      }else{
        textObject.htmlText += `<div>${i}</div>\n`;
      }
      
      textObject.cssText += `@media (min-${name}:${i}${suffix}){ ${rangeSelector}{ background-position: ${k/N*100}% } }\n`;
      
      maxn--;
      i+=obj.range.step;
      k++;
    }

    textObject.htmlText += `</pre>\n`; // closes range div
  }else{
  
    for(let n of obj.values){
      textObject.htmlText += `<pre class="v_${n}">${n}${obj.unit?obj.unit:""}</pre>`

      textObject.cssText += `@media (${name}${n===""?"":":"}${n}){\n#media-${name} > .v_${n}{ display: block }\n}\n`
    }
  }
  textObject.htmlText += "</div>\n";
  return
}

function createTexts(db){
  const textObject = {
   "htmlText":`<!DOCTYPE html>
<!--This is auto-generated file, don't edit-->
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width"/>
  <title>CSS media query test page</title>
  <link href="main.css" type="text/css" rel="stylesheet"/>
  <link href="generated.css" type="text/css" rel="stylesheet"/>
</head>
<body>
<h1>CSS media-query test page</h1>
<p>Shows values reported by css media-queries. Everything is done with css, no javascript required. Lack of "value-box" implies the media-query is not supported by the browser.</p>
<div>
`,
   "cssText":`/* Generated stylesheet */\n`
  }
  
  for(let o of Object.keys(db)){
    if(!db[o].disabled){
      createThing(o,db[o],textObject)
    }
  }

  textObject.htmlText += "</div>\n</body>\n</html>\n";

  return textObject;
}

let texts;

fs.readFile("mediadb.json","utf8")
.then(JSON.parse)
.then(createTexts)
.then(obj=>{texts=obj})
.then(()=>fs.writeFile("index.html",texts.htmlText,"utf8"))
.then(()=>console.log("successfully created index.html"))
.then(()=>fs.writeFile("generated.css",texts.cssText,"utf8"))
.then(()=>console.log("successfully created generated.css"))
.catch(e=>console.log(e))
