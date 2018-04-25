const debug = require('debug')('aklingozu:search');

const { findPrevs, findNexts } = require('./common');

const findThreads = (index) => (req, res, next) => {
  const searchTerm = req.params.searchTerm;
  req.index = index;
  req.refs = index.search(searchTerm);

  debug('refs: ');
  debug(req.refs);

  next();
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

module.exports = { findThreads, prepareThreads };
