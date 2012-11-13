#!/bin/bash
for file in greenplum-chorus-*.sh
do
  echo "Deploying $file"
  chmod +x $file
  rake deploy["upgrade21","$file"]
  exit $?
done
