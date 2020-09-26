import fetch from 'node-fetch';
import flatMap from 'lodash/flatMap';
import parseDiff from 'parse-diff';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './Home.css'

const { REACT_APP_SERVER_URL } = process.env;

class HomeBase extends Component {
  state = { tab: "PR", diff: "", url: "", loading: false };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onClickTab = (tab) => () => {
    this.setState({ tab })
  }

  createDiff = async () => {
    this.setState({ loading: true })

    const rawDiff = this.state.diff;
    const parsedDiff = parseDiff(rawDiff);
    const diff = flatMap(parsedDiff, ({ from, to, chunks }) => {
      return chunks.map((chunk, chunkIndex) => ({ from, to, chunks: [chunk], chunkIndex, description: '' }));
    })

    const response = await fetch(
      `${REACT_APP_SERVER_URL}/diffs`,
      { method: 'POST', headers: { 'content-type': 'application/json'}, body: JSON.stringify({ diff }) }
    )
    const { id } = await response.json();
    this.props.history.push(`/${id}`);
  }

  fetchAndCreateDiff = async () => {
    this.setState({ loading: true })
    const response = await fetch(
      `${REACT_APP_SERVER_URL}/github-diff?url=${encodeURIComponent(this.state.url.replace(/(\/pull\/\d+).*/, "$1.diff"))}`
    );
    this.setState({ diff: await response.text() }, () => {
      this.createDiff();
    })
  };

  render() {
    return (
      <div className='paste-diff'>
        <div className='paste-diff__tabs'>
          <div
            className={`paste-diff__tab ${this.state.tab === 'PR' ? 'paste-diff__tab--active': ''}`}
            onClick={this.onClickTab('PR')}>
              PR
          </div>
          <div
            className={`paste-diff__tab ${this.state.tab === 'DIFF' ? 'paste-diff__tab--active': ''}`}
            onClick={this.onClickTab('DIFF')}>
              Diff
          </div>
        </div>

        {this.state.tab === 'DIFF' && (
          <div className='paste-diff__tab-body'>
            <p>Paste a Git diff:</p>
            <p>
              <textarea name="diff" value={this.state.diff} onChange={this.onChange} />
            </p>
            <button onClick={this.createDiff}>
              Narrate that diff!
            </button>
            {this.state.loading && (
              <p>Loading...</p>
            )}
          </div>
        )}

        {this.state.tab === 'PR' && (
          <div className='paste-diff__tab-body'>
            <p>Paste a GitHub PR URL:</p>
            <p>
              <input name="url" value={this.state.url} onChange={this.onChange} />
            </p>
            <button onClick={this.fetchAndCreateDiff}>Narrate that diff!</button>
            {this.state.loading && (
              <p>Loading...</p>
            )}
          </div>
        )}
      </div>
    );
  }
}

export const Home = withRouter(HomeBase)
