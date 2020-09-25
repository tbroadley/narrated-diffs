import fetch from 'node-fetch';
import React, { Component } from 'react';

const { REACT_APP_SERVER_URL } = process.env;

export class PasteDiff extends Component {
  state = { diff: "", url: "" };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  fetchDiff = async () => {
    const response = await fetch(`${REACT_APP_SERVER_URL}/github-diff?url=${encodeURIComponent(this.state.url.replace(/(\/pull\/\d+).*/, "$1.diff"))}`);
    this.props.setDiff(await response.text());
  };

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
    );
  }
}
