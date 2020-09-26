import React from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import { Home } from "../Home/Home";
import { Diff } from "../Diff/Diff";

export function App() {
  return (
    <Router>
      <Switch>
        <Route path="/:id">
          {({ match }) => <Diff id={match?.params.id} />}
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}
