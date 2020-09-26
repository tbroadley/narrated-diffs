import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Home } from "../Home/Home";
import { Diff } from "../Diff/Diff";

export default function App() {
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
