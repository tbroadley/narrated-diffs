import React from 'react';
import Chunk from '../Chunk/Chunk';

export default ({ from, to, chunks }) => chunks.map(({
  oldStart,
  newStart,
  changes,
}) => (
  <Chunk
    key={`${from}-${to}-${oldStart}-${newStart}`}
    {...{ from, to, oldStart, newStart, changes }}
  />
));
