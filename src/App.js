import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { threads } from './content/fihrist.json';


class App extends Component {
  handleSearch() {
    console.log('clicked')
  }

  render() {
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
  }
}

export default App;
