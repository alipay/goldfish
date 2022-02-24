#!/usr/bin/env sh

rm -rf ./lib
../../node_modules/.bin/gulp ts
rm -rf index.js index.d.ts utils.js utils.d.ts hooks
mv ./lib/* ./
