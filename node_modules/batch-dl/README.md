<h1 align='center'>Batch DL</h1>
<div align="center">
  <p>
    <a href="https://www.npmjs.com/package/batch-dl"><img src="https://img.shields.io/npm/v/batch-dl.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/batch-dl"><img src="https://img.shields.io/npm/dt/batch-dl.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://travis-ci.org/lolPants/batch-dl"><img src="https://travis-ci.org/lolPants/batch-dl.svg" alt="Build status" /></a>
    <a href="https://david-dm.org/lolpants/batch-dl"><img src="https://img.shields.io/david/lolpants/batch-dl.svg?maxAge=3600" alt="Dependencies" /></a>
  </p>
</div>

<h5 align='center'>Command line script to batch download URLs</h5>
<h2 align='center'><i>NOTE: Node.js 8 or higher is REQUIRED</i></h2>

## Installation
Install the package globally using `npm i -g batch-dl`

## Usage
```sh
Usage: batch-dl [URLs...]

Options:
  -V, --version          output the version number
  -D, --directory <dir>  Download Directory
  -A --auto-number       Number the downloads sequentially
  -h, --help             output usage information
```

### Example
```sh
batch-dl -D ./download http://i.imgur.com/EecJUlF.png http://i.imgur.com/XHQxcf1.png
```