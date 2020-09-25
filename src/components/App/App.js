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
  state = { diff: "", url: "" };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  fetchDiff = async () => {
    const response = await fetch(`http://localhost:3500/diff?url=${encodeURIComponent(this.state.url.replace(/(\/pull\/\d+).*/, "$1.diff"))}`)
    this.props.setDiff(await response.text())
  }

  render() {
    return (
      <div className='app'>
        <p>Paste in a Git diff:</p>
        <p>
          <textarea name="diff" value={this.state.diff} onChange={this.onChange} />
        </p>
        <button onClick={() => this.props.setDiff(this.state.diff)}>Lit that diff!</button>
        <p>Or the URL of a Pull Request on GitHub:</p>
        <p>
          <input name="url" value={this.state.url} onChange={this.onChange} />
        </p>
        <button onClick={() => this.fetchDiff()}>Lit that diff!</button>
      </div>
    )
  }
}


class App extends Component {
  state = {};

  componentDidMount() {
    const storedDiff = localStorage.getItem("diff");
    if (!storedDiff) {
      return;
    }
    this.setState({
      diff: JSON.parse(storedDiff)
    });
  }

  storeLocally() {
    localStorage.setItem("diff", JSON.stringify(this.state.diff));
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      diff: arrayMove(this.state.diff, oldIndex, newIndex),
    }, () => {
      this.storeLocally();
    });
  };

  setDiff = (rawDiff) => {
    const parsedDiff = parseDiff(rawDiff);
    const diff = flatMap(parsedDiff, ({ from, to, chunks }) => {
      return chunks.map((chunk, chunkIndex) => ({ from, to, chunks: [chunk], chunkIndex, description: '' }));
    })
    this.setState({ diff }, () => {
      this.storeLocally();
    });
  }

  changeDescription = (from, to, chunkIndex, description) => {
    const file = this.state.diff.find(f => {
      return f.from === from && f.to === to && f.chunkIndex === chunkIndex;
    })

    if (!file) {
      throw new Error(`Couldn't find a file with from = ${from}, to = ${to}, and chunkIndex = ${chunkIndex}`)
    }

    file.description = description;
    this.setState({ diff: this.state.diff }, () => {
      this.storeLocally();
    })
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
