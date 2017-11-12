import React from 'react';
import './Change.css'

export default ({ type, ln2, ln, content }) => (
  <div className={`change ${type === 'add' ? 'change--added' : ''} ${type === 'del' ? 'change--deleted' : ''}`}>
    <div className='change__addition-or-deletion'>
      {type === 'add' ? '+' : ''}
      {type === 'del' ? '-' : ''}
    </div>
    <div className='change__line-number'>
      {type === 'normal' ? ln2 : ln}
    </div>
    <div className='change__content'>
      {type === 'normal' ? content : content.slice(1)}
    </div>
  </div>
)
