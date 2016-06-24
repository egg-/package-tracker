'use strict'

// cache
var TRACKER = {}

module.exports = {
  COMPANY: {
    EMS: 'ems'
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
    AIRPORT_RECEIVED: 50,
    AIRPORT_DEPARTURE: 51,
    CUSTOMS: 60,
    CUSTOMS_PENDING: 61,
    DELIVERY_START: 70,
    DELIVERY_COMPLETE: 75,
    DELIVERY_UNSUCCESSFULE: 79
  },
  company: function (company) {
    if (!TRACKER[company]) {
      TRACKER[company] = require('./tracker/' + company)
    }
    return TRACKER[company]
  }
}
