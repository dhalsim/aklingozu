const util = require('util');
const express = require('express');
const jsonfile = require('jsonfile');
const elasticlunr = require('elasticlunr');

const { findThread } = require('./get');
const { findThreads, prepareThreads } = require('./search');

const readFile = util.promisify(jsonfile.readFile);
const app = express();
const port = process.env.PORT || 2220;

app.listen(port, () => console.log(`Search api server listening on port ${port}`));

const findPrevs = (docs) => (item, prevs = []) => {
  if (item.parent) {
    const prev = docs[item.parent];

    return findPrevs(docs)(prev, prevs.concat([prev]))
  } else {
    return prevs.reverse();
  }
};

const findNexts = (docs) => (item, nexts = []) => {
  if (item.next) {
    const next = docs[item.next];

    return findNexts(docs)(next, nexts.concat([next]));
  } else {
    return nexts;
  }
};

const register = async () => {
  const dump = await readFile('./src/dist/index.elastic.nohtml.json');
  const index = elasticlunr.Index.load(dump);

  app.get('/get/:id', findThread(index));
  app.get('/search/:searchTerm', findThreads(index), prepareThreads);
};

(async () => register())();
