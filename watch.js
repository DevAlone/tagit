#!/usr/bin/env bash

npm run build && cp -a ./public/* build/ && npm run start
