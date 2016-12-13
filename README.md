# package-tracker

[![version](https://img.shields.io/npm/v/package-tracker.svg) ![download](https://img.shields.io/npm/dm/package-tracker.svg)](https://www.npmjs.com/package/package-tracker) [![status status](https://travis-ci.org/egg-/package-tracker.svg?branch=master)](https://travis-ci.org/egg-/package-tracker)

package-tracker is package tracking library for Node.js

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)


## Company List

Name | Contributor | Link
---- | ---- | ----
EMS | @egg- | https://service.epost.go.kr/trace.RetrieveEmsRigiTraceList.comm
ECARGO | @egg- | http://web.ecargo.asia/script/users/tracking.php
KPACKET | @egg- | https://service.epost.go.kr/trace.RetrieveEmsRigiTraceList.comm (ems)
JX | @egg- | https://service.epost.go.kr/trace.RetrieveEmsRigiTraceList.comm (ems)

## Installation

```
$ npm install package-tracker
```

## Usage

```javascript
var tracker = require('package-tracker')
var ems = tracker.company(tracker.COMPANY.EMS)

ems.trace({trace_number}, function (err, result) {
  console.log(result)
})
```

### command line

```sh
$ npm install -g package-tracker
$ package-tracker -h

Usage: index [options] <tracecode>

  Options:

    -h, --help               output usage information
    -c, --company <company>  Company Name

$ package-tracker -c ems EBXXXXXXXXXKR
```

## Response

### Status Code

`tracker.STATUS.{CODE}`

CODE | VALUE | DESC
---- | ---- | ----
UNKNOWN | -1 | 알수 없음
RECEIVE | 10 | 접수
DEPARTURE | 20 | 발송
DEPARTURE_READY | 21 | 발송준비
ARRIVAL | 30 | 도착
ARRIVAL_OUTWARD_OFFICE | 31 | 발송교환국에도착
ARRIVAL_INWARD_OFFICE | 32 | 교환국도착
ARRIVAL_DESTIATION_AIRPORT | 33 | 상대국도착
TRANSPER_EXPRESS | 40 | 운송사인계
TRANSPER_DESTIATION_AIRPORT | 41 | 상대국인계
TRANSPER_DESTIATION_AIRPORT | 42 | 재입고
AIRPORT_RECEIVED | 50 | 항공사인수
AIRPORT_DEPARTURE | 51 | 항공기출발
CUSTOMS_PENDING | 60 | 통관검사대기
CUSTOMS | 65 | 통관및분류
DELIVERY_START | 70 | 배달준비
DELIVERY_COMPLETE | 75 | 배달완료
DELIVERY_UNSUCCESSFULE | 79 | 미배달

### Error

CODE | VALUE | DESC
---- | ---- | ----
UNKNOWN | -1 | Unknow error
INVALID_NUMBER | 10 | invalid trace number.
INVALID_NUMBER_LENGTH | 11 | invalid trace number.
INVALID_NUMBER_HEADER | 12 | invalid trace number.
INVALID_NUMBER_COUNTRY | 13 | invalid trace number.

### Sample

```javascript
{
  "histories": [
    {
      "status_txt": "접수",
      "ts": 1465361520,
      "status": 10,
      "area": "SL.SS.HYUNDAE",
      "detail": "Posting office zip code : 06035\nTransit or Destination country : SINGAPORE"
    },
    {
      "status_txt": "발송",
      "ts": 1465362300,
      "status": 20,
      "area": "SL.SS.HYUNDAE",
      "detail": ""
    },
    {
      "status_txt": "도착",
      "ts": 1465365900,
      "status": 30,
      "area": "EASTSEOUL MAIL CENTER",
      "detail": ""
    },
    {
      "status_txt": "발송",
      "ts": 1465376700,
      "status": 20,
      "area": "EASTSEOUL MAIL CENTER",
      "detail": ""
    },
    {
      "status_txt": "발송준비",
      "ts": 1465382940,
      "status": 21,
      "area": "INTERNATIONAL POST OFFICE",
      "detail": "Dispatch number : 589"
    },
    {
      "status_txt": "발송교환국에 도착",
      "ts": 1465383600,
      "status": 31,
      "area": "INTERNATIONAL POST OFFICE",
      "detail": ""
    },
    {
      "status_txt": "운송사 인계",
      "ts": 1465390860,
      "status": 40,
      "area": "INCHEON",
      "detail": "Flight number : SQ607"
    },
    {
      "status_txt": "항공사 인수",
      "ts": 1465402200,
      "status": 50,
      "area": "INCHEON",
      "detail": ""
    },
    {
      "status_txt": "항공기 출발(예정,한국시간)",
      "ts": 1465431720,
      "status": 51,
      "area": "INCHEON",
      "detail": ""
    },
    {
      "status_txt": "상대국 도착",
      "ts": 1465451160,
      "status": 33,
      "area": "SINGAPORE",
      "detail": ""
    },
    {
      "status_txt": "교환국 도착",
      "ts": 1465474140,
      "status": 32,
      "area": "SGSIND",
      "detail": ""
    },
    {
      "status_txt": "통관 및 분류",
      "ts": 1465515300,
      "status": 60,
      "area": "SGSIND",
      "detail": ""
    },
    {
      "status_txt": "미배달",
      "ts": 1465535940,
      "status": 79,
      "area": "650416",
      "detail": "Reason : Absence of addressee\nResult :"
    },
    {
      "status_txt": "미배달",
      "ts": 1465536600,
      "status": 79,
      "area": "650416",
      "detail": "Reason : Other\nResult :"
    },
    {
      "status_txt": "배달완료",
      "ts": 1465625160,
      "status": 75,
      "area": "650416",
      "detail": "Recipient : ()\nResult : Delivery complete"
    }
  ],
  "number": "EBXXXXXXXXXKR",
  "sender": "C*aris",
  "receiver": "R*i Egg",
  "status_txt": "배달완료",
  "status": 75,
  "company": "EMS",
  "company_code": "ems"
}
```

## Test

Test with mocha

```bash
$ grunt
```

like watch

```bash
$ grunt watch
```

## Contributing

Bug reports and pull requests are welcome on Github at [https://github.com/egg-/package-tracker](https://github.com/egg-/package-tracker)

1. Fort it
1. Create your feature branch.
1. Commit your changes.
1. Push to the branch.
1. Create a new Pull Request.

## Release History

See the [CHANGELOG.md](CHANGELOG.md)

## License

package-tracker is licensed under the [MIT license](https://github.com/egg-/package-tracker/blob/master/LICENSE).
