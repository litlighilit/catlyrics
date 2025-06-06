
import { getFirstMatchNameAndLyrics } from "./index.js"

import { argv } from 'node:process';

const args = argv.slice(2);

const songname = args.length !== 0 ? args[0] : 'One Last Kiss';

getFirstMatchNameAndLyrics(songname).then(nameAndLyrics => {
  console.log(nameAndLyrics.name);
  console.log(nameAndLyrics.lyrics
    //.join('\n')
  );
}).catch( e => console.error(e) );
