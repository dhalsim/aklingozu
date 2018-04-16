const util = require('util');
const express = require('express');
const jsonfile = require('jsonfile');
const elasticlunr = require('elasticlunr');

const debug = require('debug')('aklingozu:search');
const readFile = util.promisify(jsonfile.readFile);
const app = express();

app.listen(2221, () => console.log('Search api server listening on port 2221!'));

const findThreads = (index) => (req, res, next) => {
  const searchTerm = req.params.searchTerm;
  req.index = index;
  req.refs = index.search(searchTerm);

  debug('refs: ');
  debug(req.refs);

  next();
};

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

const prepareThreads = (req, res) => {
  const docs = req.index.documentStore.docs;
  const findPrevsFunc = findPrevs(docs);
  const findNextsFunc = findNexts(docs);

  const threads = [];

  for (const { ref } of req.refs) {
    const item = docs[ref];
    const prevs = findPrevsFunc(item);
    const nexts = findNextsFunc(item);

    threads.push({ prevs, item, nexts });
  }

  req.threads = threads;

  res.send(threads);
};

const register = async () => {
  const dump = await readFile('./src/dist/index.elastic.nohtml.json');
  const index = elasticlunr.Index.load(dump);

  app.get('/search/:searchTerm', findThreads(index), prepareThreads);
};

(async () => register())();