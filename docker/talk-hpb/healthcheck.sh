#!/bin/bash

nc -z 127.0.0.1 8081 || exit 1
nc -z 127.0.0.1 8188 || exit 1
nc -z 127.0.0.1 4222 || exit 1
