import flatMap from 'lodash/flatMap';
import parseDiff from 'parse-diff';
import React, { Component } from 'react';
import { SortableContainer, arrayMove } from 'react-sortable-hoc';
import File from '../File/File';
import './App.css';

const Diff = SortableContainer(({ diff = [] }) => (
  <div className='app'>
    {
      diff.map(({
        from,
        to,
        chunks,
      }, index) => (
        <File
          key={`${from}-${to}`}
          baseKey={`${from}-${to}`}
          {...{ index, from, to, chunks }}
        />
      ))
    }
  </div>
));

class App extends Component {
  state = {};

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      diff: arrayMove(this.state.diff, oldIndex, newIndex),
    });
  };

  componentDidMount() {
    fetch('/test.diff')
      .then(response => response.text())
      .then(parseDiff)
      .then(diff => flatMap(diff, ({ from, to, chunks }) => {
        return chunks.map(chunk => ({ from, to, chunks: [chunk] }));
      }))
      .then(diff => this.setState({ diff }));
  }

  render() {
    return (
      <Diff diff={this.state.diff} onSortEnd={this.onSortEnd} />
    );
  }
}

export default App;
