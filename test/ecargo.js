'use strict'

var assert = require('assert')
var nock = require('nock')
var url = require('url')

var tracker = require('../')
var ecargo = tracker.company(tracker.COMPANY.ECARGO)

var prepareNock = function (number) {
  var trackingInfo = ecargo.trackingInfo(number)
  for (var key in trackingInfo) {
    var tracking = trackingInfo[key]
    var info = url.parse(tracking.url)

    nock([info.protocol, info.host].join('//'))[tracking.method.toLowerCase()](info.path)
      .replyWithFile(200, __dirname + '/../testhtml/ecargo-' + number + '-' + key + '.html')
  }
}

describe(tracker.COMPANY.ECARGO, function () {
  var departureNumber = 'ESDEPARTURE'
  var completeNumber = 'ESCOMPLETE'
  var unsuccessfullNumber = 'ESUNSUCCESSFULE'

  before(function () {
    // @todo add nock
    prepareNock(departureNumber)
    prepareNock(completeNumber)
    prepareNock(unsuccessfullNumber)
  })

  it('departure number', function (done) {
    ecargo.trace(departureNumber, function (err, result) {
      assert.equal(err, null)
      assert.equal(departureNumber, result.number)
      assert.equal(tracker.COMPANY.ECARGO, result.company_code)
      assert.equal(tracker.STATUS.AIRPORT_DEPARTURE, result.status)

      for (var i = 0; i < result.histories.length; i++) {
        assert.notEqual(tracker.STATUS.UNKNOWN, result.histories[i].status)
      }

      done()
    })
  })

  it('complete number', function (done) {
    ecargo.trace(completeNumber, function (err, result) {
      assert.equal(err, null)
      assert.equal(completeNumber, result.number)
      assert.equal(tracker.COMPANY.ECARGO, result.company_code)
      assert.equal(tracker.STATUS.DELIVERY_COMPLETE, result.status)

      for (var i = 0; i < result.histories.length; i++) {
        assert.notEqual(tracker.STATUS.UNKNOWN, result.histories[i].status)
      }

      done()
    })
  })

  it('unsuccessfull number', function (done) {
    ecargo.trace(unsuccessfullNumber, function (err, result) {
      assert.equal(err, null)
      assert.equal(unsuccessfullNumber, result.number)
      assert.equal(tracker.COMPANY.ECARGO, result.company_code)
      assert.equal(tracker.STATUS.DELIVERY_UNSUCCESSFULE, result.status)

      for (var i = 0; i < result.histories.length; i++) {
        assert.notEqual(tracker.STATUS.UNKNOWN, result.histories[i].status)
      }

      done()
    })
  })
})
