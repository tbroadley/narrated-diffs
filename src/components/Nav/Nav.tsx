import React from "react";
import { Link } from "react-router-dom";

import "./Nav.css";

export const Nav = ({ id, readOnly }: { id: string; readOnly?: boolean }) => (
  <div className="nav">
    {readOnly ? (
      <>
        <Link to="/">Home</Link>
        <Link to={`/${id}/edit`}>Edit this diff</Link>
      </>
    ) : (
      <>
        <Link to="/">Home</Link>
        <Link to={`/${id}`}>Link to this diff for reviewers</Link>
      </>
    )}
  </div>
);
