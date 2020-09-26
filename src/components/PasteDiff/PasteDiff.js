import fetch from 'node-fetch';
import React, { Component } from 'react';
import './PasteDiff.css'

const { REACT_APP_SERVER_URL } = process.env;

export class PasteDiff extends Component {
  state = { tab: "PR", diff: "", url: "", loading: false };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onClickTab = (tab) => () => {
    this.setState({ tab })
  }

  fetchDiff = async () => {
    this.setState({ loading: true })
    const response = await fetch(`${REACT_APP_SERVER_URL}/github-diff?url=${encodeURIComponent(this.state.url.replace(/(\/pull\/\d+).*/, "$1.diff"))}`);
    this.props.setDiff(await response.text());
    this.setState({ loading: false })
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
            <button onClick={() => {
              this.setState({ loading: true })
              this.props.setDiff(this.state.diff)
            }}>
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
            <button onClick={() => this.fetchDiff()}>Narrate that diff!</button>
            {this.state.loading && (
              <p>Loading...</p>
            )}
          </div>
        )}
      </div>
    );
  }
}
