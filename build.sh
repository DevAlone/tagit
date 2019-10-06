#!/usr/bin/env bash

npm run build
cd build
zip -r tagit.zip *
mv tagit.zip ../
cd ../
git archive -o tagit_src.zip HEAD

