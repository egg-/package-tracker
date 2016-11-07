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
  '상대국인계': 'TRANSPER_DESTIATION_AIRPORT',
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

    if (tables.length === 0) {
      return null
    }

    var summary = tables.eq(0).find('tr').eq(1).find('td,th')
    var result = {
      histories: []
    }

    result.number = summary.eq(0).text()
    result.sender = summary.eq(1).html().split('<br>')[0]
    result.receiver = summary.eq(2).html().split('<br>')[0]
    result.status_txt = summary.eq(3).text().trim()
    result.status = parseStatus(result.status_txt)
    result.company = summary.eq(4).text()
    result.company_code = ['ems', '국제특급'].indexOf(result.company.toLowerCase()) !== -1 ? tracker.COMPANY.EMS : tracker.COMPANY.KPACKET

    tables.eq(1).find('tr').each(function (idx) {
      if (idx === 0) {
        return true
      }

      var cols = $(this).find('td')
      var history = {
        status_txt: cols.eq(1).text().trim()
      }

      history.ts = moment(cols.eq(0).text().trim() + '+09:00', 'YYYY.MM.DD HH:mmZ').unix()
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
      if (cols.length === 1) {
        return false
      }

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

var validateHeader = function (number) {
  var country = number.substring(number.length - 2, number.length).toUpperCase()
  var prefix1 = number.substring(0, 1).toUpperCase()
  var prefix2 = prefix2

  if (['C', 'R', 'V', 'E', 'G', 'U', 'B', 'L'].indexOf(prefix1) !== -1 || ['LK', 'ZZ'].indexOf(prefix2) !== -1) {
    if (prefix2 === 'LK') {
      if (country === 'KR' || country === 'AU') {
        return true
      } else {
        return false
      }
    } else if (prefix2 === 'ZZ') {
      if (country === 'KR') {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }
  return false
}

var validateCountry = function (number) {
  var charNum = 0
  var country = number.substring(number.length - 2, number.length).toUpperCase()

  for (var i = 0; i < country.length; i++) {
    if (country.charCodeAt(i) >= 65 && country.charCodeAt(i) <= 90) {
      ++charNum
    }
  }
  if (charNum === 2) {
    return true
  }

  return false
}

var validate = function (number) {
  // #ref https://service.epost.go.kr//postal/jscripts/epost_trace.js
  number = number.trim()

  // check header && check country
  if (number.length !== 13) {
    return tracker.ERROR.INVALID_NUMBER_LENGTH
  } else if (validateHeader(number) === false) {
    return tracker.ERROR.INVALID_NUMBER_HEADER
  } else if (validateCountry(number) === false) {
    return tracker.ERROR.INVALID_NUMBER_COUNTRY
  }
  return null
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
    var invalidCode = validate(number)
    if (invalidCode !== null) {
      return cb(tracker.error(invalidCode))
    }

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
      if (!trace) {
        return cb(tracker.error(tracker.ERROR.INVALID_NUMBER))
      }
      trace = parse.normalize(trace, result.normalize)

      cb(null, trace)
    })
  }
}
