'use strict'

var assert = require('assert')
var nock = require('nock')
var url = require('url')

var tracker = require('../')
var ems = tracker.company(tracker.COMPANY.EMS)

var prepareNock = function (number) {
  var trackingInfo = ems.trackingInfo(number)
  for (var key in trackingInfo) {
    var tracking = trackingInfo[key]
    var info = url.parse(tracking.url)

    nock([info.protocol, info.host].join('//'))[tracking.method.toLowerCase()](info.path)
      .replyWithFile(200, __dirname + '/../testhtml/ems-' + number + '-' + key + '.html')
  }
}

describe(tracker.COMPANY.EMS, function () {
  var pendingCustomsNumber = 'EBPENDING00KR'
  var unsucessfullCustomsNumber = 'EBUNSUCCESSKR'
  var deliveryCompletesNumber = 'EBCOMPLETE0KR'
  var invalidNumber = 'INVALIDNUM0KR'

  before(function () {
    // @todo add nock
    prepareNock(pendingCustomsNumber)
    prepareNock(unsucessfullCustomsNumber)
    prepareNock(deliveryCompletesNumber)
    prepareNock(invalidNumber)
  })

  it('pending number', function (done) {
    ems.trace(pendingCustomsNumber, function (err, result) {
      assert.equal(err, null)
      assert.equal(pendingCustomsNumber, result.number)
      assert.equal(tracker.COMPANY.EMS, result.company_code)
      assert.equal(tracker.STATUS.CUSTOMS_PENDING, result.status)

      for (var i = 0; i < result.histories.length; i++) {
        assert.notEqual(tracker.STATUS.UNKNOWN, result.histories[i].status)
      }

      done()
    })
  })

  it('unsucessfull number', function (done) {
    ems.trace(unsucessfullCustomsNumber, function (err, result) {
      assert.equal(err, null)
      assert.equal(unsucessfullCustomsNumber, result.number)
      assert.equal(tracker.COMPANY.EMS, result.company_code)
      assert.equal(tracker.STATUS.DELIVERY_UNSUCCESSFULE, result.status)

      for (var i = 0; i < result.histories.length; i++) {
        assert.notEqual(tracker.STATUS.UNKNOWN, result.histories[i].status)
      }

      done()
    })
  })

  it('delivery complete number', function (done) {
    ems.trace(deliveryCompletesNumber, function (err, result) {
      assert.equal(err, null)

      assert.equal(deliveryCompletesNumber, result.number)
      assert.equal(tracker.COMPANY.EMS, result.company_code)
      assert.equal(tracker.STATUS.DELIVERY_COMPLETE, result.status)

      for (var i = 0; i < result.histories.length; i++) {
        assert.notEqual(tracker.STATUS.UNKNOWN, result.histories[i].status)
      }

      done()
    })
  })

  it('invalid number', function (done) {
    ems.trace(invalidNumber, function (err, result) {
      assert.equal(err.code, tracker.ERROR.INVALID_NUMBER_HEADER)

      done()
    })
  })
})
