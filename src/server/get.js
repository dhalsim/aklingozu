const debug = require('debug')('aklingozu:get');

const { findPrevs, findNexts } = require('./common');

const findThread = (index) => (req, res) => {
  const id = req.params.id;
  const docs = index.documentStore.docs;
  const item = docs[id];
  const prevs = findPrevs(docs)(item);
  const nexts = findNexts(docs)(item);
  res.send({ prevs, item, nexts});
};

module.exports = { findThread };
