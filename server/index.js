import Hapi from "@hapi/hapi";
import Bell from "@hapi/bell";
import Cookie from "@hapi/cookie";
import fetch from "node-fetch";
import pg from "pg";
import { v4 as uuidv4 } from "uuid";

const {
  NODE_ENV,
  SERVER_URL,
  PUBLIC_URL,
  COOKIE_PASSWORD,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} = process.env;

const pool = new pg.Pool();

const init = async () => {
  const server = Hapi.server({
    port: 3500,
    host: "localhost",
    routes: {
      cors: {
        origin:
          NODE_ENV === "production"
            ? ["narrated-diffs.thomasbroadley.com"]
            : ["*"],
        credentials: true,
      },
    },
  });

  await server.register(Bell);
  await server.register(Cookie);

  server.auth.strategy("github", "bell", {
    provider: "github",
    password: COOKIE_PASSWORD,
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    scope: ["user", "repo"],
    isSecure: false, // In production, apache2 rewrites Set-Cookie headers to create secure cookies
    location: SERVER_URL,
  });

  server.auth.strategy("session", "cookie", {
    cookie: {
      password: COOKIE_PASSWORD,
      isSecure: false, // In production, apache2 rewrites Set-Cookie headers to create secure cookies
      isSameSite: NODE_ENV === "production" && "Strict",
      path: "/",
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

          return h.redirect(PUBLIC_URL);
        } catch (e) {
          console.error(e);
        }
      },
    },
  });

  server.route({
    method: "GET",
    path: "/users/logout",
    options: {
      auth: "session",
    },
    handler: (request, h) => {
      request.cookieAuth.clear();
      return h.redirect(PUBLIC_URL);
    },
  });

  server.route({
    method: "GET",
    path: "/users/current",
    options: {
      auth: "session",
    },
    handler: async (request, h) => {
      const { credentials } = request.auth;
      if (!credentials) return h.response().code(401);

      return { githubUsername: credentials.github_username };
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
        // TODO add validation to only fetch diffs, e.g. it has to end with .diff
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
