# Donation-Client

네이버 라이브 스트리밍 서비스 [Chzzk](https://chzzk.naver.com/) / 주식회사 숲 인터넷 방송 플랫폼 [아프리카TV](https://www.afreecatv.com/)의 후원연동 비공식 라이브러리입니다.<br>

## Installation

```shell
$ npm install donation-client
```

## Before use

**이 프로젝트는 Chzzk 또는 AfreecaTV에 의해 승인, 허락되지 않았습니다.**  
이 프로젝트 혹은 라이브러리를 사용함으로써 발생하는 모든 문제는 본인의 책임입니다.

## Usage

- Chzzk

```js
const { Chzzk } = require("donation-client");

const chzzk = new Chzzk();

await chzzk.init("45e71a76e949e16a34764deb962f9d9f");
await chzzk.connect();

chzzk.on("connect", (response) => {
  console.log(response);
});

chzzk.on("message", (message) => {
  console.log(
    `${
      message.isAnonymous ? "익명" : message.nickname
    }님이 후원하셨습니다\n금액: ${message.amount}\n메시지: ${message.msg}`
  );
});

chzzk.on("error", (error) => {
  console.error(error);
});

chzzk.on("disconnect", (response) => {
  console.log(response);
});
```

- AfreecaTV

```js
const { AfreecaTV } = require("donation-client");

const afreecaTV = new AfreecaTV();
await afreecaTV.init("cotton1217");
await afreecaTV.connect();

afreecaTV.on("connect", (response) => {
  console.log(response);
});

afreecaTV.on("message", (message) => {
  console.log(message);
});

afreecaTV.on("error", (error) => {
  console.error(error);
});

afreecaTV.on("disconnect", (response) => {
  console.log(response);
});
```
