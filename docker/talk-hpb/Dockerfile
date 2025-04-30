# syntax=docker/dockerfile:latest

# Etapas de construcción
FROM nats:2.11.2-scratch AS nats
FROM eturnal/eturnal:1.12.1 AS eturnal
FROM strukturag/nextcloud-spreed-signaling:2.0.2 AS signaling

# Construir Janus WebRTC Gateway
FROM debian:bullseye-slim AS janus

ARG JANUS_VERSION=v1.3.1
WORKDIR /src

RUN set -ex; \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        ca-certificates \
        git \
        autoconf \
        automake \
        build-essential \
        pkg-config \
        libtool \
        util-linux \
        libglib2.0-dev \
        zlib1g-dev \
        libssl-dev \
        libjansson-dev \
        libnice-dev \
        libconfig-dev \
        libsrtp2-dev \
        libusrsctp-dev \
        gengetopt \
        libwebsockets-dev \
        libcurl4-openssl-dev \
        rename && \
    \
    git clone --recursive https://github.com/meetecho/janus-gateway --depth=1 --single-branch --branch "$JANUS_VERSION" /src && \
    cd /src && \
    ./autogen.sh && \
    ./configure --disable-rabbitmq --disable-mqtt --disable-boringssl && \
    make && \
    make install && \
    make configs && \
    rename 's/\.jcfg\.sample$/.jcfg/' /usr/local/etc/janus/*.jcfg.sample && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Construir Eturnal - Pendiente de remover y sanitizar
FROM debian:bullseye-slim

ENV ETURNAL_ETC_DIR="/conf"

COPY --from=janus     --chmod=777 --chown=1000:1000 /usr/local                          /usr/local
COPY --from=eturnal   --chmod=777 --chown=1000:1000 /opt/eturnal                        /opt/eturnal
COPY --from=nats      --chmod=777 --chown=1000:1000 /nats-server                        /usr/local/bin/nats-server
COPY --from=signaling --chmod=777 --chown=1000:1000 /usr/bin/nextcloud-spreed-signaling /usr/local/bin/nextcloud-spreed-signaling

COPY --chmod=775 start.sh /start.sh
COPY --chmod=775 healthcheck.sh /healthcheck.sh
COPY --chmod=664 supervisord.conf /supervisord.conf

RUN set -ex; \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        ca-certificates \
        tzdata \
        bash \
        openssl \
        supervisor \
        dnsutils \
        netcat-openbsd \
        libglib2.0-0 \
        zlib1g \
        libssl-dev \
        libjansson4 \
        libnice10 \
        libconfig9 \
        libsrtp2-dev \
        libusrsctp-dev \
        libwebsockets16 \
        curl \
        grep \
        && \
    rm -rf /var/lib/apt/lists/* && \
    \
    useradd --system -u 1000 eturnal && \
    echo "root:$(openssl rand -base64 12)" | chpasswd && \
    \
    touch /etc/nats.conf /etc/eturnal.yml && \
    echo "listen: 127.0.0.1:4222" | tee /etc/nats.conf && \
    mkdir -p /var/tmp /conf /var/lib/turn /var/log/supervisord /var/run/supervisord /usr/local/lib/janus/loggers && \
    chown eturnal:eturnal -R /etc/nats.conf /var/log/supervisord /var/run/supervisord && \
    chmod 777 -R /tmp /conf /var/run/supervisord /var/log/supervisord && \
    ln -s /opt/eturnal/bin/stun /usr/local/bin/stun && \
    ln -s /opt/eturnal/bin/eturnalctl /usr/local/bin/eturnalctl

USER 1000
ENTRYPOINT ["/start.sh"]
CMD ["supervisord", "-c", "/supervisord.conf"]

HEALTHCHECK CMD /healthcheck.sh
LABEL com.centurylinklabs.watchtower.enable="false"
