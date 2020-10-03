create table users
(
    id bigserial primary key,
    github_id bigint not null,
    github_username varchar(39) not null,
    github_token varchar(100) not null,
    constraint unq_github_id unique (github_id)
)
