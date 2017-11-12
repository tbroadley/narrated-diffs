import parseDiff from 'parse-diff';
import React, { Component } from 'react';
import File from '../File/File';
import './App.css';

class App extends Component {
  state = {};

  componentDidMount() {
    fetch('/test.diff')
      .then(response => response.text())
      .then(parseDiff)
      .then(diff => (console.log(diff), diff))
      .then(diff => this.setState({ diff }));
  }

  render() {
    return (
      (this.state.diff || []).map(({
        from,
        to,
        chunks,
      }) => (
        <File
          key={`${from}-${to}`}
          {...{ from, to, chunks }}
        />
      ))
    );
  }
}

export default App;
