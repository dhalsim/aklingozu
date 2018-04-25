import React, { Component } from 'react';

export class SearchList extends Component {
  constructor(props) {
    super(props);

    this.searchValue = this.props.searchValue;
  }

  render() {
    console.log(this.searchValue);

    return (<div></div>);
  }
}