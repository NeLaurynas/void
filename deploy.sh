#!/bin/sh
# copy this to ~ like void.sh and do ssh void.gorgut.eu 'sh void.sh'
cd void
git pull
bun install
bun run build
cp -r dist/* /var/lib/docker/volumes/docker_vesta_void_html/_data/
