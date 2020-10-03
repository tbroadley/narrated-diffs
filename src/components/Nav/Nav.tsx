import React from "react";
import { Link } from "react-router-dom";

import "./Nav.css";

const { REACT_APP_SERVER_URL } = process.env;

export const Nav = ({
  username,
  id,
  readOnly,
}: {
  username?: string;
  id?: string;
  readOnly?: boolean;
}) => (
  <div className="nav">
    {id ? (
      readOnly ? (
        <>
          <Link to="/">Home</Link>
          <Link to={`/${id}/edit`}>Edit this diff</Link>
        </>
      ) : (
        <>
          <Link to="/">Home</Link>
          <Link to={`/${id}`}>Link to this diff for reviewers</Link>
        </>
      )
    ) : null}
    <div className="nav__horizontal-fill" />
    {username ? (
      <>
        <p>Hello, {username}</p>
        <a href={`${REACT_APP_SERVER_URL}/users/logout`}>Logout</a>
      </>
    ) : (
      <a href={`${REACT_APP_SERVER_URL}/users/login`}>Login with GitHub</a>
    )}
  </div>
);
