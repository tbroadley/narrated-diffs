import React from 'react';
import Chunk from '../Chunk/Chunk';

export default ({ from, to, chunks }) => {
  const DEV_NULL = '/dev/null';

  let fileDescription;

  if (from === to) {
    fileDescription = (
      <p className='file__description'>
        {from}
      </p>
    );
  } else if (from === DEV_NULL) {
    fileDescription = (
      <p className='file__description'>
        File <span className='file__name--created'>{to}</span> created
      </p>
    );
  } else if (to === DEV_NULL) {
    fileDescription = (
      <p className='file__description'>
        File <span className='file__name--deleted'>{to}</span> deleted
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
      {fileDescription}
      {
        to === DEV_NULL ? null : chunks.map(({
          oldStart,
          newStart,
          changes,
        }) => {
          const key = `${from}-${to}-${oldStart}-${newStart}`;
          return (
            <Chunk
              key={key}
              baseKey={key}
              {...{ from, to, oldStart, newStart, changes }}
            />
          );
        })
      }
    </div>
  );
};
