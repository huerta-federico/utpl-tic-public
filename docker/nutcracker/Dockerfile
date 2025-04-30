FROM alpine:3.18

WORKDIR /tmp

COPY nutcracker.conf /etc

RUN apk --no-cache add \
    autoconf \
    automake \
    curl \
    g++ \
    git \
    libtool \
    make \
    wget && \
    wget https://github.com/twitter/twemproxy/archive/0.5.0.tar.gz -O - | tar -xz && \
    cd twemproxy-0.5.0 && \
    autoreconf -fvi && \
    ./configure && \
    make && \
    cp src/nutcracker /usr/local/bin/ && \
    cd .. && \
    rm -rf twemproxy-0.5.0

ENTRYPOINT ["/usr/local/bin/nutcracker"]
CMD ["-c", "/etc/nutcracker.conf", "--verbose=11"]