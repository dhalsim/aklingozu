const util = require('util');
const path = require('path');
const rpn = require('request-promise-native');
const jsonfile = require('jsonfile');
const html_entities = require('html-entities').AllHtmlEntities;
const cheerio = require('cheerio');
const { take, splitEvery } = require('ramda');
const { DateTime } = require('luxon');

const writeFile = util.promisify(jsonfile.writeFile);
const readFile = util.promisify(jsonfile.readFile);

const findThreads = (content) => {
  const re = /(\d*)\)\s(.*)\s<==>\s(https:\/\/twitter\.com\/aklingozu\/(?:status|statuses)\/(\d*))/g;
  let threadObjects = [];
  let matchedArray;

  while (matchedArray = re.exec(content)) {
    threadObjects.push({
      index: matchedArray[1],
      desc: matchedArray[2],
      id: matchedArray[4],
      thread_url: matchedArray[3]
    });
  }

  return threadObjects;
};

const workflow = async () => {
  const fihristFile = path.join(__dirname, '..', 'fihrist.json');
  const contentsFile = path.join(__dirname, '..', 'contents.json');

  const threads = await readFile(fihristFile).catch((error) => {
    // can't read file, re creating it
    return getAndWriteFihrist(fihristFile);
  }).then((content) => {
    const now = DateTime.local();
    const diff = now.diff(DateTime.fromISO(content.date), 'days').toObject();

    if (diff.days > 10) {
      return getAndWriteFihrist(fihristFile);
    } else {
      return content.threads;
    }
  });

  console.log(`total ${threads.length} threads found.`);

  const READ_BY = 20;
  let threadContents = [];
  for (const batch of splitEvery(READ_BY, threads)) {
    threadContents = threadContents.concat(await readTweet(batch));
    console.log(`${READ_BY} more tweets are read. total: ${threadContents.length}`);
  }

  console.log(`Writing ${threadContents.length} tweet contents to file...`);
  await writeFile(contentsFile, threadContents, { spaces: 2 }).catch(console.log);
  console.log('Finished.')
}

function readTweet(threads) {
  return Promise.all(threads.map(thr => {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        url: thr.thread_url,
        headers: {
          'accept-language': 'tr-TR',
          'content-language': 'tr-TR',
          'connection': 'close',
          'content-type': 'text/html'
        }
      };

      return rpn(requestOptions).then(content => resolve({
        thread: thr,
        content
      })).catch(reject);
    });
  }))
    .then(results => results.map(result => parseTweetContent(result.content, result.thread)))
    .catch(console.error);
}

function parseTweetContent(threadContent, thr) {
  const $ = cheerio.load(threadContent);
  const datetime = $(`div[data-tweet-id=${thr.id}] .metadata span`).html();
  const text = html_entities.decode($(`div[data-tweet-id=${thr.id}] p.js-tweet-text`).html());

  const embedTweet = (txt, url) => `
      <blockquote class="twitter-tweet" data-lang="tr">
        <p lang="tr" dir="ltr">
          ${txt}
        </p>

        &mdash; Aklın Gözü (@aklingozu)

        <a href="${thr.thread_url}">${datetime}</a></blockquote>
      <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
    `;

  const continues = $('div.replies-to ol.stream-items li').first();

  const children = $('div.ThreadedConversation-tweet', continues).map((i, child) => {
    const child_li = $('li', child);
    const id = child_li.attr('data-item-id');
    const path = $('div', child_li).attr('data-permalink-path');
    const url = `https:https://twitter.com${path}`;
    const text = $('p', child).text();

    return {
      id,
      url,
      text,
      html: embedTweet(text, url)
    };
  }).get();

  return {
    thread: thr,
    text,
    html: embedTweet(text, thr.thread_url),
    children
  };
}

async function getAndWriteFihrist(fihristFile) {
  const fihrist = await rpn('http://www.twitlonger.com/show/n_1sqe5ne');
  const decoded = html_entities.decode(fihrist);
  const threads = findThreads(decoded);
  const fileContent = {
    date: DateTime.local(),
    threads
  };
  await writeFile(fihristFile, fileContent, { spaces: 2 });

  return fileContent;
}

(async () => workflow())();
