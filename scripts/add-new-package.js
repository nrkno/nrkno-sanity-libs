/* eslint-disable no-console */

const path = require('path');
const fs = require('fs');

const [, , packageName] = process.argv;
appendTsPackageRef(packageName);

function appendTsPackageRef(packageName) {
  const fileName = path.join(process.cwd(), 'packages/tsconfig.project.json');
  const tsconfig = require(fileName);
  tsconfig.references.push({
    path: `./${packageName}/tsconfig.build.json`,
  });

  fs.writeFile(fileName, JSON.stringify(tsconfig, null, 2), (err) => {
    if (err) return console.log(err);
    console.log(`Appended ${packageName} to ${fileName}`);
  });
}
