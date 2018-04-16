const util = require('util');
// const lunr = require('lunr');
const elasticlunr = require('elasticlunr');
const jsonfile = require('jsonfile'); 
const { chain, merge } = require('ramda');

const { threads } = require('./content/fihrist.json');
const contents = require('./content/contents.json');
const writeFile = util.promisify(jsonfile.writeFile);

if (!(threads.length && contents.length)) {
  return console.error('Nothing to index, run crawl task and then indexer again');
}

/*
thread = {
  index,
  desc,
  id,
  thread_url
}

content = {
  thread: {
    index,
    desc,
    id,
    thread_url
  },
  text,
  html,
  children: {
    id,
    url,
    text,
    html
  }
}
*/

const items = chain(thr => {
  const content = contents.find(c => c.thread.index === thr.index);
  
  return [{
    id: thr.id,
    url: thr.thread_url,
    text: content.text,
    parent: null,
    next: content.children.length > 0
      ? content.children[0].id
      : null,
    thread_index: thr.index,
    thread_desc: thr.desc
  }].concat(
    content.children.map((child, index) => 
      merge({
        id: child.id,
        url: child.url,
        text: child.text
      }, { 
        parent: index === 0 
          ? thr.id 
          : content.children[index - 1].id,
        next: index < content.children.length - 1
          ? content.children[index + 1].id
          : null
      })
    )
  );
}, threads);

/*
var index = lunr(function () {
  this.field('thread_desc');
  this.field('text');
  this.ref('id');

  items.forEach(item => this.add(item), this);
});
*/

const index = elasticlunr(function () {
  this.addField('thread_desc');
  this.addField('text');
  this.setRef('id');

  for (const item of items){
    this.addDoc(item);
  }
});

console.log('creating index file...');

writeFile('./index.elastic.nohtml.json', index)
  .then(() => { 
    const tevrat = index.search('tevrat')[0];
    const bestEntry = index.documentStore.docs[tevrat.ref];

    console.log('index file is created, please copy to content folder');
    console.log(tevrat);
    console.log(util.inspect(bestEntry, false, null));
  })
  .catch(console.error);
