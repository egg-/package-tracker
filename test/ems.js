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
      .replyWithFile(200, __dirname + '/../testhtml/' + number + '_' + key + '.html')
  }
}

describe(tracker.COMPANY.EMS, function () {
  var pendingCustomsNumber = 'ems_pending_customs'
  var deliveryCompletesNumber = 'ems_delivery_complete'

  before(function () {
    prepareNock(pendingCustomsNumber)
    prepareNock(deliveryCompletesNumber)
  })

  it('pending customs number', function (done) {
    ems.trace(pendingCustomsNumber, function (err, result) {
      assert.equal(tracker.COMPANY.EMS, result.company_code)
      assert.equal(tracker.STATUS.CUSTOMS_PENDING, result.status)

      for (var i = 0; i < result.histories.length; i++) {
        assert.notEqual(tracker.STATUS.UNKNOWN, result.histories[i].status)
      }

      done()
    })
  })

  it('delivery complete number', function (done) {
    ems.trace(deliveryCompletesNumber, function (err, result) {
      assert.equal(tracker.COMPANY.EMS, result.company_code)
      assert.equal(tracker.STATUS.DELIVERY_COMPLETE, result.status)

      for (var i = 0; i < result.histories.length; i++) {
        assert.notEqual(tracker.STATUS.UNKNOWN, result.histories[i].status)
      }

      done()
    })
  })
})
