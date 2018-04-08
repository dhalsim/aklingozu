import React, { Component } from 'react';
import $ from 'jquery';

import { threads } from './content/fihrist.json';

import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { loaded: false };
  }

  handleSearch() {
    console.log('clicked');
  }

  componentDidMount() {
    $.getJSON('https://cdn.jsdelivr.net/gh/dhalsim/aklingozu@latest/src/dist/index.elastic.nohtml.json',
      (data) => { 
        console.log(data);
        this.setState({ loaded: false });
      });
  }

  render() {
    if (loaded) {
      return (
        <div className="App">
          <div>
            <input type="text" />
            <button onClick={ this.handleSearch }>Ara</button>
          </div>
  
          <ul>
            {
              threads.map(thr => {
                return (
                  <li key={ thr.index }>
                    <a>{ thr.desc }</a>
                  </li>
                );
              })
            }
          </ul>
        </div>
      );
    } else {
      <div>Yükleniyor, bekleyiniz...</div>
    }
  }
}

export default App;
