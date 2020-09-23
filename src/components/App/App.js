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
        chunkIndex
      }, index) => (
        <File
          key={`${from}-${to}-${chunkIndex}`}
          baseKey={`${from}-${to}-${chunkIndex}`}
          {...{ index, from, to, chunks }}
        />
      ))
    }
    <p>Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a></p>
  </div>
));

class PasteDiff extends Component {
  state = { diff: "" };

  onChange = (event) => {
    this.setState({ diff: event.target.value })
  }

  render() {
    return (
      <div className='app'>
        <p>Paste in a Git diff:</p>
        <p>
          <textarea value={this.state.diff} onChange={this.onChange} />
        </p>
        <button onClick={() => this.props.setDiff(this.state.diff)}>Lit that diff!</button>
      </div>
    )
  }
}


class App extends Component {
  state = {};

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      diff: arrayMove(this.state.diff, oldIndex, newIndex),
    });
  };

  setDiff = (diff) => {
    const parsedDiff = parseDiff(diff);
    const flattenedDiff = flatMap(parsedDiff, ({ from, to, chunks }) => {
      return chunks.map((chunk, chunkIndex) => ({ from, to, chunks: [chunk], chunkIndex }));
    })
    this.setState({ diff: flattenedDiff });
  }

  render() {
    const { diff } = this.state;

    if (!diff) {
      return <PasteDiff setDiff={this.setDiff} />
    }

    return (
      <Diff diff={diff} onSortEnd={this.onSortEnd} useDragHandle />
    );
  }
}

export default App;
