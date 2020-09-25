import fetch from 'node-fetch';
import React, { Component } from 'react';
import './PasteDiff.css'

const { REACT_APP_SERVER_URL } = process.env;

export class PasteDiff extends Component {
  state = { tab: "PR", diff: "", url: "" };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onClickTab = (tab) => () => {
    this.setState({ tab })
  }

  fetchDiff = async () => {
    const response = await fetch(`${REACT_APP_SERVER_URL}/github-diff?url=${encodeURIComponent(this.state.url.replace(/(\/pull\/\d+).*/, "$1.diff"))}`);
    this.props.setDiff(await response.text());
  };

  render() {
    return (
      <div className='paste-diff'>
        <div className='paste-diff__tabs'>
          <div className='paste-diff__tab' onClick={this.onClickTab('PR')}>PR</div>
          <div className='paste-diff__tab' onClick={this.onClickTab('DIFF')}>Diff</div>
        </div>

        {this.state.tab === 'DIFF' && (
          <div className='paste-diff__tab-body'>
            <p>Paste a Git diff:</p>
            <p>
              <textarea name="diff" value={this.state.diff} onChange={this.onChange} />
            </p>
            <button onClick={() => this.props.setDiff(this.state.diff)}>Narrate that diff!</button>
          </div>
        )}

        {this.state.tab === 'PR' && (
          <div className='paste-diff__tab-body'>
            <p>Paste a GitHub PR URL:</p>
            <p>
              <input name="url" value={this.state.url} onChange={this.onChange} />
            </p>
            <button onClick={() => this.fetchDiff()}>Narrate that diff!</button>
          </div>
        )}
      </div>
    );
  }
}
