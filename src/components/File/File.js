import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { SortableElement } from 'react-sortable-hoc';
import Chunk from '../Chunk/Chunk';
import './File.css';

export default SortableElement(({ index, from, to, chunks }) => {
  const [description, setDescription] = React.useState('');

  const DEV_NULL = '/dev/null';

  let fileDescription;

  if (from === to) {
    fileDescription = (
      <p className='file__description'>
        <span className='file__name'>{from}</span>
      </p>
    );
  } else if (from === DEV_NULL) {
    fileDescription = (
      <p className='file__description'>
        File <span className='file__name'>{to}</span> created
      </p>
    );
  } else if (to === DEV_NULL) {
    fileDescription = (
      <p className='file__description'>
        File <span className='file__name'>{to}</span> deleted
      </p>
    );
  } else {
    fileDescription = (
      <p className='file__description'>
        File
        <span className='file__from-name'>{from}</span>
        renamed to
        <span className='file__to-name'>{to}</span>
      </p>
    );
  }

  return (
    <div className='file'>
      <div className='file__user-text'>
        <ReactQuill
          value={description}
          onChange={(d) => setDescription ( d )}
        />
      </div>
      {fileDescription}
      {
        to === DEV_NULL ? null : chunks.map(({
          oldStart,
          newStart,
          content,
          changes,
        }) => {
          const key = `${from}-${to}-${oldStart}-${newStart}`;
          return (
            <Chunk
              key={key}
              baseKey={key}
              content={content}
              changes={changes}
            />
          );
        })
      }
    </div>
  );
});
