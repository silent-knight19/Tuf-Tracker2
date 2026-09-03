# S17: hardened image. Non-root runtime, minimal layers, no secrets,
# PORT-aware healthcheck, direct node invocation (correct SIGTERM handling —
# `npm start` as PID 1 does not forward signals).
FROM node:22-slim

# Set environment variables to prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install OpenJDK for Java compilation
# Using openjdk-17 specifically for better compatibility
# coreutils provides the 'timeout' command for kernel-level timeouts
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openjdk-17-jdk-headless \
    coreutils \
    procps && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME environment variable
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Verify Java installation (this will fail the build if Java isn't installed)
RUN java -version && javac -version

WORKDIR /app

COPY package*.json ./
# Reproducible, production-only install (lockfile is tracked and gated by S16)
RUN npm ci --omit=dev && npm cache clean --force

# Application source, readable by the runtime user. node_modules from the
# previous layer stays root-owned (read/execute is all the app needs);
# /app itself is NOT writable at runtime (company-tags write-back is
# best-effort and logs instead of failing — Render disks are ephemeral anyway).
COPY --chown=node:node . .

# S17: never run as root. The Java runner inherits this UID, so a sandbox
# escape lands in an unprivileged user instead of uid 0 (defense in depth;
# full isolation still needs the S5/S17 runner-service track).
USER node

EXPOSE 3001

# Health check against the public /health endpoint, honoring PORT
# (the old check hardcoded :3001 AND probed an authenticated route).
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "const p=process.env.PORT||3001;require('http').get('http://localhost:'+p+'/health',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
