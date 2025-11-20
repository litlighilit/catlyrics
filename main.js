#!/usr/bin/env node
import { getFirstMatchNameAndLyrics, getNstMatchNameAndLyrics, yieldNameAndSubpath } from "./index.js"

import { argv } from 'node:process';
import { program, Option } from 'commander';

function myParseInt(value, dummyPrevious) {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new commander.InvalidArgumentError('Not a number.');
  }
  return parsedValue;
}

let songname; // XXX: not work: = options.song;

program
  .option('-t, --text', 'output text instead of json')
  .addOption(new Option('-n, --nth <number>', 'choose nth result', myParseInt, 1).conflicts('num'))
  .option('-l, --list', 'list results')
  .addOption(new Option('-N, --nums', 'list results with numbers').conflicts('nth').implies('list'))
  .argument('[song]', 'song to search', 'One Last Kiss')
  .action(sn => songname = sn)
.parse()

const options = program.opts();

const plainText = options.text;
const listNames = options.list;
const listNamesWithNumbers = options.nums;
const nth = options.nth;

const waitForNameAndLyrics = it =>
  it.then(nameAndLyrics => {
    console.log(nameAndLyrics.name);
  
    let ls = nameAndLyrics.lyrics;
    if (plainText) {
      console.log('');  // print a newline
      console.log(ls.join('\n'));
    } else console.log(ls);
  }).catch( e => console.error(e) );

if (listNames) {
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

