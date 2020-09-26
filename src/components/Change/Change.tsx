import parseDiff from "parse-diff";
import React from "react";
import "./Change.css";

export function Change({ change }: { change: parseDiff.Change }) {
  const { type, content } = change;
  const lineNumber = change.type === "normal" ? change.ln2 : change.ln;

  return (
    <div
      className={`change ${type === "add" ? "change--added" : ""} ${
        type === "del" ? "change--deleted" : ""
      }`}
    >
      <div className="change__addition-or-deletion">
        {type === "add" ? "+" : ""}
        {type === "del" ? "-" : ""}
      </div>
      <div className="change__line-number">{lineNumber}</div>
      <div className="change__content">{content.slice(1)}</div>
    </div>
  );
}
