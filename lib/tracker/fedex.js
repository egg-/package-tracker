'use strict'

var request = require('request')
var moment = require('moment')

var tracker = require('../')

// https://www.fedex.com/us/developer/WebHelp/ws/2014/dvg/WS_DVG_WebHelp/Appendix_Q_Track_Service_Scan_Codes.htm
var STATUS_MAP = {
  OC: 'RECEIVE',
  AR: 'DEPARTURE_READY',
  DP: 'DEPARTURE',
  OX: '',
  IT: '',
  OD: 'DELIVERY_START',
  DL: 'DELIVERY_COMPLETE'
}

var trackingInfo = function (numbers) {
  var trackingInfoList = []
  if (numbers instanceof Array === false) {
    numbers = [numbers]
  }
  for (var i = 0; i < numbers.length; i++) {
    trackingInfoList.push({
      trackNumberInfo: {
        trackingNumber: numbers[i]
      }
    })
  }
  return {
    trace: {
      method: 'POST',
      url: 'https://www.fedex.com/trackingCal/track',
      data: {
        data: {
          TrackPackagesRequest: {
            trackingInfoList: trackingInfoList
          }
        },
        action: 'trackpackages'
      }
    }
  }
}

var normalize = function (item) {
  var result = {
    histories: []
  }

  var scanEventList = item.scanEventList

  result.number = item.displayTrackingNbr
  result.sender = ''
  result.receiver = ''
  result.company = 'FedEx'
  result.company_code = tracker.COMPANY.FEDEX

  for (var i = 0, len = scanEventList.length; i < len; i++) {
    var history = {}

    history.ts = moment([scanEventList[i].date, scanEventList[i].time, scanEventList[i].gmtOffset].join(' '))
    history.status_txt = scanEventList[i].status
    history.status = tracker.STATUS[STATUS_MAP[scanEventList[i].statusCD]] || tracker.STATUS.UNKNOWN

    result.histories.push(history)
  }

  var history = result.histories[result.histories.length - 1]

  result.status_txt = history.status_txt
  result.status = history.status

  return result
}

var parse = {
  trace: function (body) {
    var packageList = body.TrackPackagesResponse.packageList
    var result = []

    for (var i = 0, len = packageList.length; i < len; i++) {
      result.push(normalize(packageList[i]))
    }

    return result
  }
}

module.exports = {
  trackingInfo: trackingInfo,
  /**
   * @method trace
   * @param {string} number
   * @param {function} cb
   */
  trace: function (number, cb) {
    var tracking = trackingInfo(number)

    request.post({
      url: tracking.trace.url,
      from: tracking.trace.data,
      json: true
    }, function (err, res, body) {
      if (err) {
        return cb(err)
      }

      var traces = parse.trace(body)
      cb(traces.length === 0 ? tracker.error(tracker.ERROR_INVALID_NUMBER) : null, traces[0])
    })
  }
}
