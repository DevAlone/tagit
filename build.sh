#!/usr/bin/env bash

rm tagit*.zip
npm run build
cd build
zip -r tagit.zip *
mv tagit.zip ../
cd ../
git archive -o tagit_src.zip HEAD

