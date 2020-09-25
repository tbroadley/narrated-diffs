# Narrated Diffs

A tool to enable PR authors to tell a story with their changes.

Paste a diff into the tool (you can easily get one by adding `.diff` to the end of a GitHub PR URL, e.g. https://github.com/tbroadley/spellchecker-cli/pull/59.diff). Then you can reorder chunks in the diff and add comments to them, to make it easier for PR reviewers to understand the purpose of your change.

## Future work

### MLP (minimum loveable product)

- [x] Store narrated diffs in a database and make them accessible to others
  - Store the JSON of the App's `diff` state
  - Give diffs unique, unguessable identifiers on creation (on explicit save?)
- [x] Allow pasting in a link to a GitHub PR and initialise a narrated diff for it
  - GitHub doesn't allow cross-origin requests, so we'll need to fetch the diff on the server

### Later

- Create a browser extension that makes it easy to initialise narrated diffs from a GitHub PR page
- Buttons to move a chunk to the top or bottom of the narrated diff, or up or down one spot
- Allow merging chunks together
- Allow splitting chunks
  - Look at how `git add --patch` does it
- File tree element on the left
  - Filter the chunk list by selecting a file in the tree
  - Filter out chunks from a specific file
  - Banned files are hidden from the chunk list by default but allow viewing them through the file tree
  - See a list of chunks in their original order under each file in the tree, navigate quickly by clicking on them
    - Show the position in the file, the context line?
- Permissions system (authenticate with GitHub/GitLab?)
- On PR creation, automatically add link to narrated diff in PR description, or in a comment
- On PR merge, automatically add link to narrated diff to the merge commit and lock the narrated diff
  - Webhook from GitHub to Narrated Diffs backend that is sent on PR merge?
  - GitHub Actions?
- Syntax highlighting
- Separate reviewing and editing modes
  - Want to render the HTML from Quill - need to pass through `rehype-sanitize`, preferably on the server
