//const { DOMParser } = require('xmldom');
//import { DOMParser } from 'dom-parser';
import { parse } from "node-html-parser";
import assert from "node:assert";

const BaseUrl = 'https://lyrics.net.cn'
function chkString(s) {
    const typ = typeof(s)
    if (typ !== 'string')
        throw new TypeError(`a string expected, but got ${s}: ${typ}`);
}


function htmlStructChanged(dest) {
    const msg = `fail to extract ${dest} from page, need to update used CSS selector`
    //console.assert(false, );
    throw new assert.AssertionError(msg);
}

class NotImplementedError extends TypeError {}

function notImpl(msg) {
    throw new NotImplementedError(msg);
}

async function getFromSubpath(subpath) {
    const lyricsPageUrl = BaseUrl + subpath;
    const lyricsResponse = await fetch(lyricsPageUrl);
    const lyricsHtml = await lyricsResponse.text();

    const lyricsDoc = parse(lyricsHtml);

    // extract from page
    const lyricsContent = lyricsDoc.querySelector('.lyrics_main');
    if (!lyricsContent) {
        htmlStructChanged('lyrics');
    }
    const interpLyricsHref = lyricsContent.lastElementChild;
    if (interpLyricsHref.tagName === 'A' && interpLyricsHref.text === "查看歌词解读")
        lyricsContent.removeChild(interpLyricsHref)

    //return lyricsContent.innerText;
    const res = []
    for (const i of lyricsContent.children) {
        if (i.tagName === 'DIV') {
            let text = '';
            if (i.children.length === 0) text = i.text;
            else {
                for (const sub of i.children) {
                    if (sub.tagName === "RUBY") {
                        text += sub.firstChild.text;
                        // next shall be <rt>
                    } else {
                        notImpl("");
                    }
                }
            }
            res.push(text);
        } else {
            htmlStructChanged("lyrics list");
        }
    }
    return res;
}

//const getFromId = async (id) => await getFromSubpath(`/lyrics/${id}`);

function notFound() {
    throw new Error('failed to find such a song');
}

/**
 * returns a object
 * @param {string} name 
 * @param {string[]} lyrics 
 */
function mkRes(name, lyrics) {
    return {name: name, lyrics: lyrics};
}

export
async function* yieldNameAndSubpath(songname) {
    chkString(songname);
    const searchUrl = `${BaseUrl}/search/?q=${encodeURIComponent(songname)}`;
    // fetch webpage
    const response = await fetch(searchUrl);
    const html = await response.text();

    // parse HTML
    //const parser = new DOMParser();
    const document = //parser.parseFromString(html, 'text/html');
        parse(html);

    const results = document.querySelectorAll('.search_title');
    let destPreDiv = null;
    results.forEach(div => {
        if (div.textContent.includes("歌曲名")) {
            destPreDiv = div;
        }
    });
    if (!destPreDiv) {
        notFound();
    }
    // extract URL
    const lyricsPageLinks = destPreDiv.nextElementSibling;

    for(const i of lyricsPageLinks.children) {
        if (i.tagName !== 'A')
            htmlStructChanged("song name");
        const href = i.getAttribute('href');
        chkString(href);
        yield {name: i.text, subpath: href};

    }
}

/**
 * @param {string} songname
 * @param {integer} n: starting from 1
 */
export
async function getNstMatchNameAndLyrics(songname, n) {
    let item;
    let itor = yieldNameAndSubpath(songname);
    assert(n>0, "starting from 1");
    for (let ord = 0; ord < n; ord++) {
      item = await itor.next();
      if (item.done) {
	if (ord == 0)
          htmlStructChanged('lyrics href');
	throw new RangeError(`only ${ord} lyrics found, but expected ${n}`)
      }
    }
    const val = item.value;
    return mkRes(val.name, await getFromSubpath(val.subpath));
}

/**
 * @param {string} songname
 */
export
async function getFirstMatchNameAndLyrics(songname) {
    return await getNstMatchNameAndLyrics(songname, 1);
}

/**
 * @param {string} songname
 */
export
async function* yieldNameAndLyrics(songname) {
    for await (const val of yieldNameAndSubpath(songname)) {
        yield mkRes(val.name, await getFromSubpath(val.href));
    }
}
