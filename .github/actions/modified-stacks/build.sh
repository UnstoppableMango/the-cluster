#!/bin/bash
set -eu

npm i -g @vercel/ncc
ncc build index.js --license licenses.txt
