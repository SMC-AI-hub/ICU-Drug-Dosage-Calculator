#!/usr/bin/env python3
"""Serve the installable offline package for the live preview.

  /                  -> pwa/index.html        (installable app root; SW scope "/")
  /sw.js             -> service worker        (no-store, so updates apply)
  /manifest.webmanifest, /icons/*, /standalone.html  -> static
  /standalone        -> docs/standalone.html   (the one-file twin)
  /qa/<file>         -> the QA scripts (read-only)

Everything else -> 404. Nothing outside these paths is exposed.
"""
import http.server
import os
import socketserver
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
PWA = os.path.join(ROOT, "docs")
APP = os.path.join(ROOT, "docs", "standalone.html")
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".css": "text/css; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
}

NO_STORE = {"index.html", "sw.js", "manifest.webmanifest"}


class Handler(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _send(self, code, data, ctype, no_store=False):
        if isinstance(data, str):
            data = data.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store" if no_store else "max-age=300")
        self.end_headers()
        self.wfile.write(data)

    def _file(self, path):
        name = os.path.basename(path)
        with open(path, "rb") as f:
            body = f.read()
        ext = os.path.splitext(path)[1].lower()
        self._send(200, body, MIME.get(ext, "application/octet-stream"),
                   no_store=name in NO_STORE)

    def do_GET(self):
        path = self.path.split("?")[0].split("#")[0]
        if path in ("/", "/index.html"):
            return self._file(os.path.join(PWA, "index.html"))
        if path in ("/standalone", "/Paediatric-Drug-Calculator.html"):
            if not os.path.exists(APP):
                return self._send(404, "Not built yet.", "text/plain", True)
            return self._file(APP)
        if path.startswith("/qa/"):
            name = os.path.basename(path)
            if name in ("validate.js", "smoke.js", "run.sh"):
                return self._file(os.path.join(ROOT, "qa", name))
            return self._send(404, "Not found", "text/plain", True)
        if path.startswith("/"):
            rel = path.lstrip("/")
            full = os.path.normpath(os.path.join(PWA, rel))
            # never escape the pwa directory
            if full.startswith(PWA + os.sep) and os.path.isfile(full):
                return self._file(full)
        return self._send(404, "Not found", "text/plain", True)

    def log_message(self, fmt, *args):
        sys.stderr.write("[preview] " + (fmt % args) + "\n")


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    with Server(("0.0.0.0", PORT), Handler) as httpd:
        print(f"serving {PWA} on 0.0.0.0:{PORT}  (SW scope '/')", flush=True)
        httpd.serve_forever()
