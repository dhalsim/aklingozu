import React, { Component } from 'react';
import $ from 'jquery';

import { threads } from './content/fihrist.json';
import { SearchList } from './components/SearchList';

import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      loaded: false,
      index: null,
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

  componentDidMount() {
    const version = '@v0.3'
    const localStorage = window.localStorage;
    const localStorageIndexKey = `index${version}`;
    const index = localStorage.getItem(localStorageIndexKey);

    if (localStorage && index) {
      this.setState({ loaded: true, index: JSON.parse(index) });

      console.log('this.state.index: ', this.state.index);      
    } else {
      $.get({
        url: `https://cdn.jsdelivr.net/gh/dhalsim/aklingozu${version}/src/dist/index.elastic.nohtml.json`,
        success: (data) => { 
          console.log('data length: ', data.length);
          if (localStorage) {

            localStorage.setItem(localStorageIndexKey, data);
          }

          this.setState({ loaded: true, index: data });
        },
        dataType: 'text'
      });
    }
  }

  render() {
    if (this.state.loaded) {
      return (
        <div className="App">
          <SearchList dump={this.state.index}></SearchList>

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
    } else {
      return (<div>Yükleniyor, bekleyiniz...</div>);
    }
  }
}

export default App;
