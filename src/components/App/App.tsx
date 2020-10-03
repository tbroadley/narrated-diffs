import React from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import { Home } from "../Home/Home";
import { Diff } from "../Diff/Diff";
import { Nav } from "../Nav/Nav";

const { REACT_APP_SERVER_URL } = process.env;

export function App() {
  const [username, setUsername] = React.useState(undefined);

  React.useEffect(() => {
    (async () => {
      const response = await fetch(`${REACT_APP_SERVER_URL}/users/current`, {
        credentials: "include",
      });
      const { githubUsername } = await response.json();
      setUsername(githubUsername);
    })();
  }, []);

  return (
    <Router>
      <Switch>
        <Route path="/:id/edit">
          {({ match }) => (
            <div>
              <Nav username={username} id={match?.params.id} />
              <Diff id={match?.params.id} />
            </div>
          )}
        </Route>
        <Route path="/:id">
          {({ match }) => (
            <div>
              <Nav username={username} id={match?.params.id} readOnly />
              <Diff id={match?.params.id} readOnly />
            </div>
          )}
        </Route>
        <Route path="/">
          <Nav username={username} />
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}
