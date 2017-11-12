import React from 'react';
import './Change.css'

export default ({ type, ln2, ln, content }) => (
  <div className="change">
    {
      type === 'normal' ? (
        `${ln2}: ${content}`
      ) : ''
    }
    {
      type === 'add' ? (
        `+ ${ln}: ${content.slice(1)}`
      ) : ''
    }
    {
      type === 'del' ? (
        `- ${ln}: ${content.slice(1)}`
      ) : ''
    }
  </div>
)
