import React, { Component } from 'react';

import { threads } from './content/fihrist.json';
import { SearchList } from './components/SearchList';

import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      search: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
  }

  clearSearch() {
    this.setState({ search: '' });
  }

  handleChange(event) {
    this.setState({ search: event.target.value });
  }

  render() {
    console.log('sdsdd');

    return (
      <div className="App">
        <SearchList searchValue={ this.state.search }></SearchList>

        <div>
          <input type="text" 
            value={ this.state.search }
            onChange={ this.handleChange } />
          <button onClick={ this.clearSearch }>Temizle</button>
        </div>

        <ul>
          {
            threads.map(thr => {
              return (
                <li key={ thr.index }>
                  <a href="javascript;">{ thr.desc }</a>
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  }
}

export default App;
