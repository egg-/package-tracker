'use strict'

// cache
var TRACKER = {}

var ERROR = {
  UNKNOWN: -1,
  INVALID_NUMBER: 10,
  INVALID_NUMBER_LENGTH: 11,
  INVALID_NUMBER_HEADER: 12,
  INVALID_NUMBER_COUNTRY: 13
}

module.exports = {
  COMPANY: {
    EMS: 'ems',
    ECARGO: 'ecargo',
    KPACKET: 'kpacket'
  },
  STATUS: {
    UNKNOWN: -1,
    RECEIVE: 10,
    DEPARTURE: 20,
    DEPARTURE_READY: 21,
    ARRIVAL: 30,
    ARRIVAL_OUTWARD_OFFICE: 31,
    ARRIVAL_INWARD_OFFICE: 32,
    ARRIVAL_DESTIATION_AIRPORT: 33,
    TRANSPER_EXPRESS: 40,
    TRANSPER_DESTIATION_AIRPORT: 41,
    TRANSPER_INHOUSE: 42,
    AIRPORT_RECEIVED: 50,
    AIRPORT_DEPARTURE: 51,
    CUSTOMS: 60,
    CUSTOMS_PENDING: 61,
    DELIVERY_START: 70,
    DELIVERY_COMPLETE: 75,
    DELIVERY_UNSUCCESSFULE: 79
  },
  ERROR: ERROR,
  error: function (code) {
    var error = {
      code: ERROR.UNKNOWN,
      message: 'unknown error.'
    }

    switch (code) {
      case ERROR.INVALID_NUMBER:
      case ERROR.INVALID_NUMBER_LENGTH:
      case ERROR.INVALID_NUMBER_HEADER:
      case ERROR.INVALID_NUMBER_COUNTRY:
        error.code = code
        error.message = 'invalid trace number.'
        break
    }

    return error
  },
  company: function (company) {
    if (!TRACKER[company]) {
      TRACKER[company] = require('./tracker/' + company)
    }
    return TRACKER[company]
  }
}
