#!/bin/bash
set -e

echo "Building benchmark.db from CMS data..."
mkdir -p data/raw
cd data/raw
curl -L -o rvu26b.zip "https://www.cms.gov/files/zip/rvu26b-updated-05-1-2026.zip"
unzip -o rvu26b.zip -d rvu26b
cd ../../pricing
python ingest_rvu.py --csv ../data/raw/rvu26b/PPRRVU2026_Apr_nonQPP.csv --db benchmark.db