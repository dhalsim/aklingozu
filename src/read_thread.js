const util = require('util');
const jsonfile = require('jsonfile'); 
const elasticlunr = require('elasticlunr');

const readFile = util.promisify(jsonfile.readFile);

const writeThreads = (entry, docs) => {
  console.log(util.inspect(entry, false, null));

  if (entry.next) {
    const next = docs[entry.next];
    writeThreads(next, docs);
  }
};

const workflow = async () => {
  const dump = await readFile('./index.elastic.nospace.json');
  const index = elasticlunr.Index.load(dump);
  
  const su = index.search('bal')[0];
  const bestEntry = index.documentStore.docs[su.ref];

  writeThreads(bestEntry, index.documentStore.docs);
};

(async () => workflow())();