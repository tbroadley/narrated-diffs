import { throttle } from 'lodash';
import flatMap from 'lodash/flatMap';
import parseDiff from 'parse-diff';
import React, { Component } from 'react';
import { SortableContainer, arrayMove } from 'react-sortable-hoc';
import File from '../File/File';
import './OldApp.css';
import { PasteDiff } from '../PasteDiff/PasteDiff';

const { REACT_APP_SERVER_URL } = process.env;

const Diff = SortableContainer(({ diff = [], changeDescription, moveToTop, moveToBottom }) => (
  <div className='old-app'>
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
          moveToTop={moveToTop}
          moveToBottom={moveToBottom}
          eltIndex={index}
          {...{ index, from, to, chunks }}
        />
      ))
    }
    <p>Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a></p>
  </div>
));

class App extends Component {
  state = {};

  async componentDidMount() {
    const id = window.location.pathname.split('/')[1]
    if (!id) {
      return
    }

    this.setState({ loading: true })
    const response = await fetch(`${REACT_APP_SERVER_URL}/diffs/${id}`)
    const { diff } = await response.json();
    this.setState({ id, diff, loading: false })
  }

  persistDiff = throttle(async () => {
    const { id, diff } = this.state;

    if (id) {
      return fetch(
        `${REACT_APP_SERVER_URL}/diffs/${id}`,
        { method: 'PATCH', headers: { 'content-type': 'application/json'}, body: JSON.stringify({ id, diff }) }
      )
    }

    const response = await fetch(
      `${REACT_APP_SERVER_URL}/diffs`,
      { method: 'POST', headers: { 'content-type': 'application/json'}, body: JSON.stringify({ diff }) }
    )
    const newId = (await response.json()).id;
    this.setState({ id: newId })
    window.history.replaceState({}, '', `/${newId}`);
  }, 1000)

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      diff: arrayMove(this.state.diff, oldIndex, newIndex),
    }, () => {
      this.persistDiff();
    });
  };

  moveToTop = (oldIndex) => this.onSortEnd({ oldIndex, newIndex: 0 })
  moveToBottom = (oldIndex) => this.onSortEnd({ oldIndex, newIndex: this.state.diff.length - 1 })

  setDiff = (rawDiff) => {
    const parsedDiff = parseDiff(rawDiff);
    const diff = flatMap(parsedDiff, ({ from, to, chunks }) => {
      return chunks.map((chunk, chunkIndex) => ({ from, to, chunks: [chunk], chunkIndex, description: '' }));
    })
    this.setState({ diff }, () => {
      this.persistDiff();
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
      this.persistDiff();
    })
  }

  render() {
    const { loading, diff } = this.state;

    if (loading) {
      return <div className='old-app'><p>Loading...</p></div>
    }

    if (!diff) {
      return <PasteDiff setDiff={this.setDiff} />
    }

    return (
      <Diff diff={diff} onSortEnd={this.onSortEnd} changeDescription={this.changeDescription} moveToTop={this.moveToTop} moveToBottom={this.moveToBottom} useDragHandle />
    );
  }
}

export default App;
