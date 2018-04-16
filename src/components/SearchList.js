import React, { Component } from 'react';
import elasticlunr from 'elasticlunr';

export class SearchList extends Component {
  constructor(props) {
    super(props);

    this.index = elasticlunr.Index.load(this.props.dump);
    this.searchValue = this.props.searchValue;
  }

  findMostParent(tweet) {
    return tweet.parent 
      ? this.findMostParent(tweet.parent)
      : tweet;
  }

  getChildren(tweet, tweets) {
    return tweet.next
      ? this.getChildren(tweet.next, tweets.concat([tweet.next]))
      : tweets;
  }

  render() {
    const threads = this.index.search(this.searchValue);
    const ancestors = threads.map(this.findMostParent);
    const families = ancestors.map(tweet => this.getChildren(tweet, [tweet]));

    return (
      <div>
        { families.map(this.renderFamily) }
      </div>
    );
  }

  renderFamily(family) {
    return (
      family.map(tweet =>
        <div>{ tweet.text }</div>
      )
    );
  }
}