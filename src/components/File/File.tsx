import parseDiff from "parse-diff";
import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { SortableElement, SortableHandle } from "react-sortable-hoc";

import { Chunk } from "../Chunk/Chunk";
import "./File.css";
import move from "../../move.svg";

const DragHandle = SortableHandle(() => (
  <img className="file__drag-handle" src={move} alt="Drag and drop this file" />
));

type FileProps = {
  readOnly: boolean;
  eltIndex: number;
  from: string;
  to: string;
  chunkIndex: number;
  chunks: parseDiff.Chunk[];
  description: string;
  changeDescription: (
    from: string,
    to: string,
    chunkIndex: number,
    description: string
  ) => void;
  moveToTop: (index: number) => void;
  moveToBottom: (index: number) => void;
};

const FileBase = SortableElement(
  ({
    readOnly,
    eltIndex,
    from,
    to,
    chunkIndex,
    chunks,
    description,
    changeDescription,
    moveToTop,
    moveToBottom,
  }: FileProps) => {
    const DEV_NULL = "/dev/null";

    let fileDescription;

    if (from === to) {
      fileDescription = (
        <p className="file__description">
          <span className="file__name">{from}</span>
        </p>
      );
    } else if (from === DEV_NULL) {
      fileDescription = (
        <p className="file__description">
          File <span className="file__name">{to}</span> created
        </p>
      );
    } else if (to === DEV_NULL) {
      fileDescription = (
        <p className="file__description">
          File <span className="file__name">{from}</span> deleted
        </p>
      );
    } else {
      fileDescription = (
        <p className="file__description">
          File <span className="file__from-name">{from}</span> renamed to{" "}
          <span className="file__to-name">{to}</span>
        </p>
      );
    }

    return (
      <div className="file">
        {readOnly ? (
          <div dangerouslySetInnerHTML={{ __html: description }} />
        ) : (
          <>
            <div className="file__controls">
              <DragHandle />
              <button onClick={() => moveToTop(eltIndex)}>Move to top</button>
              <button onClick={() => moveToBottom(eltIndex)}>
                Move to bottom
              </button>
            </div>
            <div className="file__user-text">
              <ReactQuill
                value={description}
                onChange={(d) => changeDescription(from, to, chunkIndex, d)}
              />
            </div>
          </>
        )}

        {fileDescription}
        {to === DEV_NULL
          ? null
          : chunks.map(({ oldStart, newStart, content, changes }) => {
              const key = `${from}-${to}-${oldStart}-${newStart}`;
              return (
                <Chunk
                  key={key}
                  baseKey={key}
                  content={content}
                  changes={changes}
                />
              );
            })}
      </div>
    );
  }
);

export function File(props: FileProps) {
  const BANNED_FILES = ["package-lock.json", "yarn.lock"];

  if (BANNED_FILES.includes(props.from) || BANNED_FILES.includes(props.to)) {
    return null;
  }

  return <FileBase index={props.eltIndex} {...props} />;
}
