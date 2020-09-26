import parseDiff from "parse-diff";
import React from "react";

import { Change } from "../Change/Change";
import "./Chunk.css";

export function Chunk({
  baseKey,
  content,
  changes,
}: {
  baseKey: string;
  content: string;
  changes: parseDiff.Change[];
}) {
  return (
    <div className="chunk">
      <p className="chunk__content">{content}</p>
      {changes.map((change) => {
        const line =
          change.type === "normal" ? `${change.ln1}-${change.ln2}` : change.ln;
        const key = `${baseKey}-${change.type}-${line}`;
        return <Change key={key} change={change} />;
      })}
    </div>
  );
}
