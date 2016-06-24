'use strict'

var request = require('request')
var async = require('async')
var cheerio = require('cheerio')
var moment = require('moment')

var tracker = require('../')

var STATUS_MAP = {
  '접수': 'RECEIVE',
  '발송': 'DEPARTURE',
  '발송준비': 'DEPARTURE_READY',
  '도착': 'ARRIVAL',
  '발송교환국에도착': 'ARRIVAL_OUTWARD_OFFICE',
  '교환국도착': 'ARRIVAL_INWARD_OFFICE',
  '상대국도착': 'ARRIVAL_DESTIATION_AIRPORT',
  '운송사인계': 'TRANSPER_EXPRESS',
  '항공사인수': 'AIRPORT_RECEIVED',
  '항공기출발': 'AIRPORT_DEPARTURE',
  '통관검사대기': 'CUSTOMS_PENDING',
  '통관및분류': 'CUSTOMS',
  '배달준비': 'DELIVERY_START',
  '배달완료': 'DELIVERY_COMPLETE',
  '미배달': 'DELIVERY_UNSUCCESSFULE'
}

var parseStatus = function (txt) {
  return tracker.STATUS[STATUS_MAP[txt.replace(/\s/gim, '').replace(/\(.*\)/gim, '')]] || tracker.STATUS.UNKNOWN
}

var parse = {
  trace: function (body) {
    var $ = cheerio.load(body)
    var print = $('#print')
    var tables = print.find('table')
    var summary = tables.eq(0).find('td')

    var result = {
      histories: []
    }

    result.number = summary.eq(0).text()
    result.sender = summary.eq(1).html().split('<br>')[0]
    result.receiver = summary.eq(2).html().split('<br>')[0]
    result.status_txt = summary.eq(3).text().trim()
    result.status = parseStatus(result.status_txt)
    result.company = summary.eq(4).text()
    result.company_code = tracker.COMPANY.EMS

    tables.eq(1).find('tr').each(function (idx) {
      if (idx === 0) {
        return true
      }

      var cols = $(this).find('td')
      var history = {
        status_txt: cols.eq(1).text().trim()
      }

      history.ts = moment(cols.eq(0).text().trim(), 'YYYY.MM.DD HH:mm').unix()
      history.status = parseStatus(history.status_txt)

      result.histories.push(history)
    })

    return result
  },
  normalize: function (trace, body) {
    var $ = cheerio.load(body)

    $('.table_col').find('tr').each(function (idx) {
      if (idx === 0) {
        return true
      }

      var cols = $(this).find('td')

      // update area
      trace.histories[idx - 1].area = cols.eq(2).text().trim()
      trace.histories[idx - 1].detail = []

      cols.eq(3).find('p').each(function () {
        trace.histories[idx - 1].detail.push($(this).text().trim().replace(/\t/gim, '').replace(/\n/gi, '\n').replace(/\s{2,}/gi, ' '))
      })

      trace.histories[idx - 1].detail = trace.histories[idx - 1].detail.join('\n')
    })

    return trace
  }
}

var trackingInfo = function (number) {
  return {
    trace: {
      method: 'GET',
      url: 'https://service.epost.go.kr/trace.RetrieveEmsRigiTraceList.comm?POST_CODE=' + number + '&displayHeader=N'
    },
    normalize: {
      method: 'POST',
      url: 'https://trace.epost.go.kr/xtts/servlet/kpl.tts.common.svl.SttSVL',
      data: {
        target_command: 'kpl.tts.tt.epost.cmd.RetrieveEmsTraceEngCmd',
        JspURI: '/xtts/tt/epost/ems/EmsSearchResultEng.jsp',
        POST_CODE: number
      }
    }
  }
}

module.exports = {
  trackingInfo: trackingInfo,
  trace: function (number, cb) {
    var tracking = trackingInfo(number)

    async.parallel({
      trace: function (cb) {
        request({
          url: tracking.trace.url
        }, function (err, res, body) {
          cb(err, err ? null : body)
        })
      },
      normalize: function (cb) {
        request.post({
          url: tracking.normalize.url,
          form: tracking.normalize.data
        }, function (err, res, body) {
          cb(err, err ? null : body)
        })
      }
    }, function (err, result) {
      if (err) {
        return cb(err)
      }

      var trace = parse.trace(result.trace)
      trace = parse.normalize(trace, result.normalize)

      cb(null, trace)
    })
  }
}
