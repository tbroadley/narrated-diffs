import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from 'react-router-dom'
import { Home } from '../Home/Home';

export default () => (
    <Router>
        <Switch>
            <Route path="/:id">
                {/* ({ match }) => <Diff id={id} /> */}
            </Route>
            <Route path="/">
                <Home />
            </Route>
        </Switch>
    </Router>
)
