import Hapi from "@hapi/hapi";
import Bell from "@hapi/bell";
import Cookie from "@hapi/cookie";
import fetch from "node-fetch";
import pg from "pg";
import { v4 as uuidv4 } from "uuid";

const pool = new pg.Pool();

const init = async () => {
  const server = Hapi.server({
    port: 3500,
    host: "localhost",
    routes: {
      cors: {
        // TODO restrict this
        origin: ["*"],
        credentials: true,
      },
    },
  });

  await server.register(Bell);
  await server.register(Cookie);

  server.auth.strategy("github", "bell", {
    provider: "github",
    password:
      "riddance bunion supplier laptop humped purebred commodity unbraided letdown retry catalyze clambake",
    clientId: "57f384e33d904dc4345e",
    clientSecret: "5a32924f61414ed324d1d369b1dde9cdfa6226d0",
    scope: ["user", "repo"],
    isSecure: process.env.NODE_ENV === "production",
  });

  server.auth.strategy("session", "cookie", {
    cookie: {
      password:
        "riddance bunion supplier laptop humped purebred commodity unbraided letdown retry catalyze clambake",
      isSecure: process.env.NODE_ENV === "production",
      path: "/",
      isSameSite: process.env.NODE_ENV === "production" && "Strict",
    },
    validateFunc: async (_, session) => {
      const response = await pool.query("SELECT * FROM users WHERE id = $1", [
        session.id,
      ]);

      if (!response.rowCount === 0) {
        return { valid: false };
      }

      return { valid: true, credentials: response.rows[0] };
    },
  });

  server.route({
    method: ["GET", "POST"],
    path: "/users/login",
    options: {
      auth: {
        mode: "try",
        strategy: "github",
      },
      handler: async (request, h) => {
        try {
          const { auth } = request;

          if (!auth.isAuthenticated) {
            return h
              .response(`GitHub authentication failed: ${auth.error.message}`)
              .code(401);
          }

          // TODO handle refresh tokens
          const {
            token,
            profile: { id: githubId, username },
          } = auth.credentials;

          let response = await pool.query(
            "SELECT * FROM users WHERE github_id = $1",
            [githubId]
          );

          if (response.rowCount === 0) {
            await pool.query(
              "INSERT INTO users (github_id, github_username, github_token) values ($1, $2, $3)",
              [githubId, username, token]
            );
            response = await pool.query(
              "SELECT * FROM users WHERE github_id = $1",
              [githubId]
            );
          } else {
            await pool.query(
              "UPDATE users set github_username = $1, github_token = $2 where github_id = $3",
              [username, token, githubId]
            );
            response = await pool.query(
              "SELECT * FROM users WHERE github_id = $1",
              [githubId]
            );
          }

          request.cookieAuth.set({ id: response.rows[0].id });

          return h.redirect("http://localhost:3000");
        } catch (e) {
          console.error(e);
        }
      },
    },
  });

  server.route({
    method: "GET",
    path: "/github-diff",
    options: {
      auth: {
        strategy: "session",
        mode: "try",
      },
    },
    handler: async (request, h) => {
      const { credentials } = request.auth;

      let response;

      const { url, owner, repo, pull_number: pullNumber } = request.query;
      if (url) {
        // FIXME add validation to only fetch diffs, e.g. it has to end with .diff
        response = await fetch(url);
      } else {
        response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
          {
            headers: {
              accept: "application/vnd.github.diff",
              Authorization:
                credentials?.github_token &&
                `token ${credentials.github_token}`,
            },
          }
        );
      }
      return h
        .response(await response.text())
        .code(response.status)
        .type("text/plain");
    },
  });

  server.route({
    method: "GET",
    path: "/diffs/{id}",
    handler: async (request, h) => {
      const { id } = request.params;

      const response = await pool.query("SELECT * FROM diffs WHERE id = $1", [
        id,
      ]);
      if (response.rowCount === 0) {
        return h.response().code(404);
      }

      const { diff } = response.rows[0];
      return { id, diff: JSON.parse(diff) };
    },
  });

  server.route({
    method: "POST",
    path: "/diffs",
    handler: async (request) => {
      const diff = request.payload.diff;
      const id = uuidv4();

      await pool.query("INSERT INTO diffs (id, diff) VALUES ($1, $2)", [
        id,
        JSON.stringify(diff),
      ]);
      return { id, diff };
    },
  });

  server.route({
    method: "PATCH",
    path: "/diffs/{id}",
    handler: async (request) => {
      const { id, diff } = request.payload;

      await pool.query("UPDATE diffs SET diff = $1 WHERE id = $2", [
        JSON.stringify(diff),
        id,
      ]);
      return { id, diff };
    },
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
