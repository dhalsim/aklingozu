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
    html: content.html,
    parent: null,
    thread_index: thr.index,
    thread_desc: thr.desc
  }].concat(
    content.children.map((child, index) => 
      merge(child, { 
        parent: index === 0 
          ? thr.id 
          : content.children[index - 1].id 
        }
      )
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

var index = elasticlunr(function () {
  this.addField('thread_desc');
  this.addField('text');
  this.setRef('id');

  items.forEach(item => this.addDoc(item));
});

console.log('creating index file...');


writeFile('./index.elastic.nospace.json', index)
  .then(() => { 
    console.log('index file is created, please copy to content folder');
    console.log(util.inspect(index.search('tevrat')[0], false, null));
  })
  .catch(console.error);
