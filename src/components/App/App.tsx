import React from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import { Home } from "../Home/Home";
import { Diff } from "../Diff/Diff";
import { Nav } from "../Nav/Nav";

export function App() {
  return (
    <Router>
      <Switch>
        <Route path="/:id/edit">
          {({ match }) => (
            <div>
              <Nav id={match?.params.id} />
              <Diff id={match?.params.id} />
            </div>
          )}
        </Route>
        <Route path="/:id">
          {({ match }) => (
            <div>
              <Nav id={match?.params.id} readOnly />
              <Diff id={match?.params.id} readOnly />
            </div>
          )}
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}
