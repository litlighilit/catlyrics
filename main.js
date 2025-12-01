#!/usr/bin/env node
import { getFirstMatchNameAndLyrics, getNstMatchNameAndLyrics, yieldNameAndSubpath } from "./index.js"

import { argv } from 'node:process';
import { ArgumentParser } from 'argparse';

const parser = new ArgumentParser({
	prog: 'catlyrics'
});


parser.add_argument('-t', '--text', {help: 'output text instead of json', action: 'store_true'})
parser.add_argument('-n', '--nth', {type: 'int', help: 'choose nth result', default: 1})
parser.add_argument('song', {help: 'song to search', default: 'One Last Kiss'})

parser.add_argument('-l', '--list', {help: 'list all results', action: 'store_true'})
parser.add_argument('-N', '--nums', {help: 'list all results with numbers', action: 'store_true'})

const options = parser.parse_args()

const plainText = options.text;
const listNames = options.list;
const listNamesWithNumbers = options.nums;
const nth = options.nth;
const songname = options.song;

const waitForNameAndLyrics = it =>
  it.then(nameAndLyrics => {
    console.log(nameAndLyrics.name);
  
    let ls = nameAndLyrics.lyrics;
    if (plainText) {
      console.log('');  // print a newline
      console.log(ls.join('\n'));
    } else console.log(ls);
  }).catch( e => console.error(e) );

if (listNames || listNamesWithNumbers) {
  let log = name => console.log(name);
  let num = 1;
  if (listNamesWithNumbers) log = name => {
    console.log(num, name);
    num++;
  }
  for await (let nAndP of yieldNameAndSubpath(songname)){
    log(nAndP.name);
  }
} else if (nth !== null) {
  waitForNameAndLyrics(getNstMatchNameAndLyrics(songname, nth));
} else {
  waitForNameAndLyrics(getFirstMatchNameAndLyrics(songname));
}

