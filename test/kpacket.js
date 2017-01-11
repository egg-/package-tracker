/* globals before it describe */

'use strict'

var assert = require('assert')
var nock = require('nock')
var url = require('url')

var tracker = require('../')
var kpacket = tracker.company(tracker.COMPANY.KPACKET)

var prepareNock = function (number) {
  var trackingInfo = kpacket.trackingInfo(number)
  for (var key in trackingInfo) {
    var tracking = trackingInfo[key]
    var info = url.parse(tracking.url)

    nock([info.protocol, info.host].join('//'))[tracking.method.toLowerCase()](info.path)
      .replyWithFile(200, __dirname + '/fixtures/kpacket-' + number + '-' + key + '.html')
  }
}

describe(tracker.COMPANY.KPACKET, function () {
  var arrivalInwardNumber = 'REARRIVALINKR'
  var unsucessfullCustomsNumber = 'EBUNSUCCESSKR'
  var deliveryCompletesNumber = 'EBCOMPLETE0KR'
  var invalidNumber = 'INVALIDNUM0KR'

  before(function () {
    // @todo add nock
    prepareNock(arrivalInwardNumber)
    prepareNock(unsucessfullCustomsNumber)
    prepareNock(deliveryCompletesNumber)
    prepareNock(invalidNumber)
  })

  it('arrival inward number', function (done) {
    kpacket.trace(arrivalInwardNumber, function (err, result) {
      assert.equal(err, null)
      assert.equal(arrivalInwardNumber, result.number)
      assert.equal(tracker.COMPANY.KPACKET, result.company_code)
      assert.equal(tracker.STATUS.ARRIVAL_INWARD_OFFICE, result.status)

      for (var i = 0; i < result.histories.length; i++) {
        assert.notEqual(tracker.STATUS.UNKNOWN, result.histories[i].status)
      }

      done()
    })
  })

  it('unsucessfull number', function (done) {
    kpacket.trace(unsucessfullCustomsNumber, function (err, result) {
      assert.equal(err, null)
      assert.equal(unsucessfullCustomsNumber, result.number)
      assert.equal(tracker.COMPANY.KPACKET, result.company_code)
      assert.equal(tracker.STATUS.DELIVERY_UNSUCCESSFULE, result.status)

      for (var i = 0; i < result.histories.length; i++) {
        assert.notEqual(tracker.STATUS.UNKNOWN, result.histories[i].status)
      }

      done()
    })
  })

  it('delivery complete number', function (done) {
    kpacket.trace(deliveryCompletesNumber, function (err, result) {
      assert.equal(err, null)

      assert.equal(deliveryCompletesNumber, result.number)
      assert.equal(tracker.COMPANY.KPACKET, result.company_code)
      assert.equal(tracker.STATUS.DELIVERY_COMPLETE, result.status)

      for (var i = 0; i < result.histories.length; i++) {
        assert.notEqual(tracker.STATUS.UNKNOWN, result.histories[i].status)
      }

      done()
    })
  })

  it('invalid number', function (done) {
    kpacket.trace(invalidNumber, function (err, result) {
      assert.equal(err.code, tracker.ERROR.INVALID_NUMBER_HEADER)

      done()
    })
  })
})
