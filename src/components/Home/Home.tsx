import flatMap from "lodash/flatMap";
import parseDiff from "parse-diff";
import React, { Component } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import "./Home.css";

const { REACT_APP_SERVER_URL } = process.env;

enum Tab {
  PR,
  DIFF,
}

class HomeBase extends Component<RouteComponentProps> {
  state = { tab: Tab.PR, diff: "", url: "", loading: false, error: undefined };

  onChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onClickTab = (tab: Tab) => () => {
    this.setState({ tab });
  };

  setError = (error: string) => {
    this.setState({
      loading: false,
      error,
    });
  };

  createDiff = async () => {
    this.setState({ loading: true, error: undefined });

    const rawDiff = this.state.diff;

    let parsedDiff;
    try {
      parsedDiff = parseDiff(rawDiff);
    } catch (e) {
      this.setError(`Couldn't parse that diff: ${e.message}`);
      return;
    }

    const diff = flatMap(parsedDiff, ({ from, to, chunks }) => {
      return chunks.map((chunk, chunkIndex) => ({
        from,
        to,
        chunks: [chunk],
        chunkIndex,
        description: "",
      }));
    });

    try {
      const response = await fetch(`${REACT_APP_SERVER_URL}/diffs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ diff }),
      });
      if (!response.ok) {
        this.setError("Couldn't create a narrated diff");
        return;
      }

      const { id } = await response.json();
      this.props.history.push(`/${id}/edit`);
    } catch (e) {
      this.setError(`Couldn't create a narrated diff: ${e.message}`);
    }
  };

  fetchAndCreateDiff = async () => {
    this.setState({ loading: true, error: undefined });

    const match = this.state.url.match(
      /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/
    );
    if (!match) {
      this.setError("Couldn't parse that GitHub PR URL");
      return;
    }

    const [, owner, repo, pullNumber] = match;
    if (!owner || !repo || !pullNumber) {
      this.setError("Couldn't parse that GitHub PR URL");
      return;
    }

    try {
      const response = await fetch(
        `${REACT_APP_SERVER_URL}/github-diff?owner=${owner}&repo=${repo}&pull_number=${pullNumber}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        this.setError(
          `Couldn't fetch the diff for that GitHub PR: ${
            (await response.json()).message
          }`
        );
        return;
      }

      this.setState({ diff: await response.text() }, () => {
        this.createDiff();
      });
    } catch (e) {
      this.setError(`Couldn't fetch the diff for that GitHub PR: ${e.message}`);
    }
  };

  render() {
    return (
      <div className="home">
        <div className="paste-diff">
          <div className="paste-diff__tabs">
            <div
              className={`paste-diff__tab ${
                this.state.tab === Tab.PR ? "paste-diff__tab--active" : ""
              }`}
              onClick={this.onClickTab(Tab.PR)}
            >
              PR
            </div>
            <div
              className={`paste-diff__tab ${
                this.state.tab === Tab.DIFF ? "paste-diff__tab--active" : ""
              }`}
              onClick={this.onClickTab(Tab.DIFF)}
            >
              Diff
            </div>
          </div>

          {this.state.tab === Tab.DIFF && (
            <div className="paste-diff__tab-body">
              <p>Paste a Git diff:</p>
              <p>
                <textarea
                  name="diff"
                  value={this.state.diff}
                  onChange={this.onChange}
                />
              </p>
              <button onClick={this.createDiff}>Narrate that diff!</button>
              {this.state.loading && <p>Loading...</p>}
            </div>
          )}

          {this.state.tab === Tab.PR && (
            <div className="paste-diff__tab-body">
              <p>Paste a GitHub PR URL:</p>
              <p>
                <input
                  name="url"
                  value={this.state.url}
                  onChange={this.onChange}
                />
              </p>
              <button onClick={this.fetchAndCreateDiff}>
                Narrate that diff!
              </button>
              {this.state.loading && <p>Loading...</p>}
              {this.state.error && (
                <p className="paste-diff__error">{this.state.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export const Home = withRouter(HomeBase);
