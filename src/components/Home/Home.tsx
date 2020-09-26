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
  state = { tab: Tab.PR, diff: "", url: "", loading: false };

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

  createDiff = async () => {
    this.setState({ loading: true });

    const rawDiff = this.state.diff;
    const parsedDiff = parseDiff(rawDiff);
    const diff = flatMap(parsedDiff, ({ from, to, chunks }) => {
      return chunks.map((chunk, chunkIndex) => ({
        from,
        to,
        chunks: [chunk],
        chunkIndex,
        description: "",
      }));
    });

    const response = await fetch(`${REACT_APP_SERVER_URL}/diffs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ diff }),
    });
    const { id } = await response.json();
    this.props.history.push(`/${id}/edit`);
  };

  fetchAndCreateDiff = async () => {
    this.setState({ loading: true });
    const response = await fetch(
      `${REACT_APP_SERVER_URL}/github-diff?url=${encodeURIComponent(
        this.state.url.replace(/(\/pull\/\d+).*/, "$1.diff")
      )}`
    );
    this.setState({ diff: await response.text() }, () => {
      this.createDiff();
    });
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
            </div>
          )}
        </div>
      </div>
    );
  }
}

export const Home = withRouter(HomeBase);
