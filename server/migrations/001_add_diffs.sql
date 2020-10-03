create table diffs
(
    id uuid primary key,
    diff text not null default '[]'
)
