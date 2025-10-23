#!/usr/bin/env node
import { getFirstMatchNameAndLyrics, yieldNameAndSubpath } from "./index.js"

import { argv } from 'node:process';

const args = argv.slice(2);

const getitemOrDefault = (arr, idx, defval) => 
  idx < arr.length ? arr[idx] : defval
;


let songname = getitemOrDefault(args, 0, 'One Last Kiss');

let optStr;
if (songname[0]=='-') {
  optStr = songname;
  songname = args[1];
} else {
  optStr = getitemOrDefault(args, 1, "")
}

let plainText = optStr == "-t" || optStr == "--text";
let listNames = optStr == "-l" || optStr == "--list";

if (listNames) {
  for await (let nAndP of yieldNameAndSubpath(songname)){
    console.log(nAndP.name);
  }
} else {
  getFirstMatchNameAndLyrics(songname).then(nameAndLyrics => {
    console.log(nameAndLyrics.name);
  
    let ls = nameAndLyrics.lyrics;
    if (plainText) {
      console.log('');  // print a newline
      console.log(ls.join('\n'));
    } else console.log(ls);
  }).catch( e => console.error(e) );
}

