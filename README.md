# MongoDB read-only layer for AlexandraJS aMule

[![Build Status](https://travis-ci.org/alexandrajs/amule-more.svg?branch=master)](https://travis-ci.org/alexandrajs/amule-more)
[![Coverage Status](https://coveralls.io/repos/github/alexandrajs/amule-more/badge.svg?branch=master)](https://coveralls.io/github/alexandrajs/amule-more?branch=master)
[![Code Climate](https://codeclimate.com/github/alexandrajs/amule-more/badges/gpa.svg)](https://codeclimate.com/github/alexandrajs/amule-more)

## Installation
```bash
$ npm i amule-more --save
```

## Usage
```javascript
const AMule = require('amule');
const Aim = require('amule-aim');
const Rush = require('amule-rush');
const More = require('amule-more');
const mule = new AMule();

// Add some compatible caches
mule.use(new Aim());
mule.use(new Rush());
mule.use(new More());

// Use it as single cache
```

## API docs
[MongoDB read-only layer API](http://alexandrajs.github.io/amule-more/)
