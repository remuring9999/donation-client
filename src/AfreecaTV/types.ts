/**
 * @example
 * "FetchError" 아프리카TV API 요청 중 오류 발생
 * "InitError" 아프리카TV 초기화 중 오류 발생
 * "PacketError" 아프리카TV 패킷 처리 중 오류 발생
 */

export type ErrorNames = "FetchError" | "InitError" | "PacketError";

/**
 * @example
 * "message" 아프리카TV 소켓으로부터 메시지 수신
 * "disconnect" 아프리카TV 소켓 연결이 끊어짐
 * "error" 아프리카TV 소켓 연결 중 오류 발생
 * "connect" 아프리카TV 소켓에 성공적으로 연결됨
 */
export type AfreecaEvent = "connect" | "message" | "disconnect" | "error";

/**
 * @example
 * "AFREECATV_MESSAGE" 아프리카TV 메시지 수신 (별풍선 메시지)
 * "AFREECATV_ERROR" 아프리카TV 소켓 오류 발생
 * "AFREECATV_DISCONNECTED" 아프리카TV 소켓 연결 끊김
 */
export type ResponseCode =
  | "AFREECATV_MESSAGE"
  | "AFREECATV_ERROR"
  | "AFREECATV_DISCONNECTED";

/**
 * 아프리카TV Class EventEmitter가 emit하는 Response 오브젝트
 */
export interface Response {
  /**
   * 오류 여부
   */
  error: boolean;
  /**
   * Response 코드
   */
  code: ResponseCode;
  /**
   * 반환 메시지
   */
  message: string;
  /**
   * 상세 오류 내용
   */
  errorDetail?: any;
}

/**
 * 아프리카TV 소켓에서 수신되는 후원메시지 타입
 */
export interface DonationResponse extends Response {
  /**
   * 후원자 닉네임
   */
  nickname: string;
  /**
   * 후원 금액
   */
  amount: number;
  /**
   * 후원 메시지
   */
  msg: string;
  /**
   * bj 아이디
   */
  bjid: string;
}

export interface AfreecaConfig {
  CHDOMAIN: string;
  CHATNO: string;
  FTK: string;
  TITLE: string;
  BJID: string;
  CHPT: number | null;
  BJNICK: string;
}
