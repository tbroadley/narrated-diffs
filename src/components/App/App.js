import flatMap from 'lodash/flatMap';
import parseDiff from 'parse-diff';
import React, { Component } from 'react';
import { SortableContainer, arrayMove } from 'react-sortable-hoc';
import File from '../File/File';
import './App.css';

const Diff = SortableContainer(({ diff = [], changeDescription }) => (
  <div className='app'>
    {
      diff.map(({
        from,
        to,
        chunks,
        chunkIndex,
        description,
      }, index) => (
        <File
          key={`${from}-${to}-${chunkIndex}`}
          baseKey={`${from}-${to}-${chunkIndex}`}
          description={description}
          changeDescription={changeDescription}
          chunkIndex={chunkIndex}
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

  setDiff = (rawDiff) => {
    const parsedDiff = parseDiff(rawDiff);
    const diff = flatMap(parsedDiff, ({ from, to, chunks }) => {
      return chunks.map((chunk, chunkIndex) => ({ from, to, chunks: [chunk], chunkIndex, description: '' }));
    })
    this.setState({ diff });
  }

  changeDescription = (from, to, chunkIndex, description) => {
    const file = this.state.diff.find(f => {
      return f.from === from && f.to === to && f.chunkIndex === chunkIndex;
    })

    if (!file) {
      throw new Error(`Couldn't find a file with from = ${from}, to = ${to}, and chunkIndex = ${chunkIndex}`)
    }

    file.description = description;
    this.setState({ diff: this.state.diff })
  }

  render() {
    const { diff } = this.state;

    if (!diff) {
      return <PasteDiff setDiff={this.setDiff} />
    }

    return (
      <Diff diff={diff} onSortEnd={this.onSortEnd} changeDescription={this.changeDescription} useDragHandle />
    );
  }
}

export default App;
