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

module.exports = { findPrevs, findNexts };
