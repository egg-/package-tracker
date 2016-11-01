'use strict'

var request = require('request')
var cheerio = require('cheerio')
var moment = require('moment')

var tracker = require('../')

var STATUS_MAP = {
  '배송예약': 'RECEIVE',
  '배송사인수': 'AIRPORT_RECEIVED',
  '출항': 'AIRPORT_DEPARTURE',
  '배송사이관': 'ARRIVAL_OUTWARD_OFFICE',
  '배송지도착': 'ARRIVAL_DESTIATION_AIRPORT',
  '현지배송사인수': 'TRANSPER_EXPRESS',
  '기타처리중': 'CUSTOMS_PENDING',
  '재입고': 'TRANSPER_INHOUSE',
  '배송출발': 'DELIVERY_START',
  '배송완료': 'DELIVERY_COMPLETE'
}

var parseStatus = function (txt) {
  return tracker.STATUS[STATUS_MAP[txt.replace(/\s/gim, '').replace(/\(.*\)/gim, '')]] || tracker.STATUS.UNKNOWN
}

var parse = {
  trace: function (body) {
    var $ = cheerio.load(body)
    var tables = $('table')

    if (tables.length === 0) {
      return null
    }

    var summary = tables.eq(5).find('td')
    var result = {
      histories: []
    }

    result.number = $('#search_no').eq(0).attr('value')
    result.sender = summary.eq(0).text()
    result.receiver = summary.eq(1).text()
    result.company = 'ECARGO'
    result.company_code = tracker.COMPANY.ECARGO

    tables.eq(6).find('tr').each(function (idx) {
      // header
      if (idx === 0) {
        return true
      }

      var cols = $(this).find('td')
      var history = {
        status_txt: cols.eq(5).text().trim()
      }

      history.ts = moment([cols.eq(1).text().trim(), cols.eq(2).text().trim()].join(' ') + '+09:00', 'YYYY.MM.DD HH:mmZ').unix()
      history.status = parseStatus(history.status_txt)

      result.histories.push(history)
    })

    var history = result.histories[result.histories.length - 1]

    result.status_txt = history.status_txt
    result.status = history.status

    return result
  }
}

var trackingInfo = function (number) {
  return {
    trace: {
      method: 'POST',
      url: 'http://web.ecargo.asia/script/users/tracking.php',
      data: {
        mode: 'search',
        search_no: number
      }
    }
  }
}

module.exports = {
  trackingInfo: trackingInfo,
  trace: function (number, cb) {
    var tracking = trackingInfo(number)

    request.post({
      url: tracking.trace.url,
      form: tracking.trace.data
    }, function (err, res, body) {
      if (err) {
        return cb(err)
      }

      var trace = parse.trace(body)
      cb(!trace ? tracker.error(tracker.ERROR.INVALID_NUMBER) : null, trace)
    })
  }
}
