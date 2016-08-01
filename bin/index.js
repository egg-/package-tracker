#! /usr/bin/env node

var program = require('commander')
var tracker = require('../')

program
  .arguments('<tracecode>')
  .option('-c, --company <company>', 'Company Name', /^(ems)$/i, 'ems')
  .action(function (tracecode) {
    if (!tracker.COMPANY[program.company.toUpperCase()]) {
      console.error('The Company is not supported.')
      process.exit(1)
    } else if (!tracecode) {
      console.error('Please enter a tracecode.')
      process.exit(1)
    }

    var company = tracker.company(program.company)
    company.trace(tracecode, function (err, result) {
      if (err) {
        console.error(err)
        process.exit(1)
      }

      console.log(JSON.stringify(result, null, 2))
      process.exit(0)
    })
  })
  .parse(process.argv)
