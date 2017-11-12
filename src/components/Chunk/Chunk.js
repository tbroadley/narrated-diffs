import React from 'react';
import Change from '../Change/Change';

export default ({ from, to, oldStart, newStart, changes }) => changes.map(({
  type,
  ln1,
  ln2,
  ln,
  content,
}) => (
  <Change
    key={`${from}-${to}-${oldStart}-${newStart}-${type}` + (
      type === 'normal' ? `-${ln1}-${ln2}` : `-${ln}`
    )}
    {...{ type, ln1, ln2, ln, content }}
  />
))
