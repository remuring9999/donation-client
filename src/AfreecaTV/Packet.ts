// 상수 정의
export const F = "\u000c";
export const ESC = "\u001b\t";
export const COMMAND_PING = "0000";
export const COMMAND_CONNECT = "0001";
export const COMMAND_JOIN = "0002";
export const COMMAND_ENTER = "0004";
export const COMMAND_ENTER_FAN = "0127"; // 0004직후 호출 됨, 입장한 유저의 열혈팬/팬 구분으로 추정
export const COMMAND_CHAT = "0005";
export const COMMAND_DONE = "0018";
export const COMMNAD_C = "0110";
export const COMMNAD_D = "0054";
export const COMMNAD_E = "0090";
export const COMMNAD_F = "0094";

// 최초 접속 패킷
export const CONNECT_PACKET = makePacket(
  COMMAND_CONNECT,
  `${F.repeat(3)}16${F}`
);

// CONNECT_PACKET 전송시 수신 하는 패킷
export const CONNECT_RES_PACKET = makePacket(
  COMMAND_CONNECT,
  `${F.repeat(2)}16|0${F}`
);

// keepAlive 패킷
export const PING_PACKET = makePacket(COMMAND_PING, F);

// 채팅방 입장 패킷
export const CHAT_JOIN_PACKET = (CHATNO: string) => {
  return makePacket(COMMAND_JOIN, `${F}${CHATNO}${F.repeat(5)}`);
};

// 패킷 생성 함수
function makePacket(command: string, data: string) {
  return `${ESC}${command}${makeLengthPacket(data)}${data}`;
}

// 패킷 길이 생성 함수
function makeLengthPacket(data: string) {
  return `${data.length.toString().padStart(6, "0")}00`;
}
