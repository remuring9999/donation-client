/**
 * @example
 * "CHZZK_CONNECTED" 치지직 채팅소켓에 성공적으로 연결됨
 * "CHZZK_DISCONNECTED" 치지직 채팅소켓 연결이 끊어짐
 * "CHZZK_ERROR" 치지직 채팅소켓 연결 중 오류 발생
 * "CHZZK_MESSAGE" 치지직 채팅소켓으로부터 메시지 수신 (후원 메시지)
 */
export type ResponseCode =
  | "CHZZK_CONNECTED"
  | "CHZZK_DISCONNECTED"
  | "CHZZK_ERROR"
  | "CHZZK_MESSAGE";

/**
 * @example
 * "message" 치지직 채팅소켓으로부터 메시지 수신
 * "disconnect" 치지직 채팅소켓 연결이 끊어짐
 * "error" 치지직 채팅소켓 연결 중 오류 발생
 * "connect" 치지직 채팅소켓에 성공적으로 연결됨
 */
export type ChzzkEvent = "message" | "disconnect" | "error" | "connect";

/**
 * @example
 * "InitError" 치지직 초기화 중 오류 발생
 * "FetchError" 치지직 API 요청 중 오류 발생
 *
 */
export type ChzzkErrorNames = "InitError" | "FetchError";

/**
 * Chzzk Class EventEmitter가 emit하는 Response 오브젝트
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
   * 연결된 채널 ID
   */
  channelId?: string;
  /**
   * 상세 오류 내용
   */
  errorDetail?: any;
}

/**
 * Chzzk 소켓에서 수신되는 후원메시자 타입
 */
export interface DonationResponse extends Response {
  /**
   * 익명후원 여부
   */
  isAnonymous: boolean;
  /**
   * 후원자 닉네임
   */
  nickname: string;
  /**
   * 채널 id
   */
  channelId: string;
  /**
   * 후원 금액
   */
  amount: number;
  /**
   * 후원 메시지
   */
  msg: string;
  /**
   * 후원자 프로필 정보
   */
  profile: MessageProfile;
}

/**
 * Chzzk 소켓에서 수신되는 메시지 타입
 */
export interface Message {
  svcid: string | "game";
  ver: string | "1";
  bdy: MessageBody[];
  cmd: number;
  tid: number | null;
  cid: string;
}

/**
 * Message.bdy를 참조하는 타입
 */
export interface MessageBody {
  svcid: string | "game";

  cid: string;

  mbrCnt: number;

  uid: string;

  profile: MessageProfile;

  msg: string;

  msgTypeCode: number;

  msgStatusType: string;

  extras: MessageExtras;

  ctime: number;

  utime: number;

  msgTid: null;

  msgTime: number;
}

/**
 * 메시지 송신자 프로필 정보
 */
export interface MessageProfile {
  userIdHash: string;
  nickname: string;
  profileImageUrl: string;
  userRoleCode:
    | "common_user"
    | "streamer"
    | "streaming_chat_manager"
    | "streaming_channel_manager"
    | "manager";
  badge?: {
    imageUrl: string;
  };
  title?: {
    name: string;
    color: string;
  };
  verifiedMark: boolean;
  activityBadges: [];
  streamingProperty: [];
}

/**
 * MessageProfile.streamingProperty를 참조하는 타입
 */
export interface StreamingProperty {
  realTimeDonationRanking?: {
    badge?: {
      title: string;
      imageUrl: string;
    };
  };
  subscription?: {
    accumulativeMonth: number;
    tier: number;
    badge: {
      imageUrl: string;
    };
  };
  following?: {
    followDate: string;
  };
  nicknameColor: {
    colorCode: string;
  };
}

/**
 * MessageProfile.activityBadges를 참조하는 타입
 */
export interface ActivityBadge {
  badgeNo: number;
  badgeId: string;
  imageUrl: string;
  title: string;
  description: string;
  activated: boolean;
}

/**
 * Messag.extras를 참조하는 타입
 */
export interface MessageExtras {
  chatType: "STREAMING";
  isAnonymous: boolean;
  nickname?: string;
  payType: string;
  payAmount: number;
  weeklyRankList: DonationRank[];
  donationUserWeeklyRank?: DonationRank;
  emojis: Record<string, string> | "";
  osType: "PC" | "AOS" | "IOS";
  streamingChannelId: string;
}

/**
 * 후원순위 정보 MessageExtras 참조
 */
export interface DonationRank {
  userIdHash: string;
  nickName: string;
  verifiedMark: boolean;
  donationAmount: number;
  ranking: number;
}
