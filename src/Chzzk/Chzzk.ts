import WebSocket from "ws";
import httpClient from "../Requests/httpClient";
import { ChzzkEvent, DonationResponse, Message, Response } from "./types";
import { EventEmitter } from "events";
import ChzzkError from "./ChzzkError";

// 상수변수 선언
const SERVICE = "game";
const VERSION = "2";
const DEV_TYPE = 2001;
const ACCESS_TOKEN_URL =
  "https://comm-api.game.naver.com/nng_main/v1/chats/access-token";
const SOCKET_URL = "wss://kr-ss4.chat.naver.com/chat";

class Chzzk extends EventEmitter {
  private client: httpClient;
  private requestOptions: RequestInit = {};
  private cid: string | null = null;
  private accessToken: string | null = null;
  public socket: WebSocket | null = null;

  public constructor(requestOptions?: RequestInit) {
    super();
    if (requestOptions) this.requestOptions = requestOptions;
    this.requestOptions.headers = {
      "User-Agent": "Mozilla",
    };
    this.client = new httpClient(this.requestOptions);
  }

  /**
   * Chzzk Class 인스턴스를 초기화하고 치지직 소켓에 연결할 준비를 합니다.
   * @param channelId 연결할 채널의 ID
   * @returns {Promise<string>} Access Token
   */
  public async init(channelId: string) {
    await this.getLiveDetail(channelId);
    await this.getAccessToken();

    return this.accessToken;
  }

  /**
   * 치지직 채팅소켓 접속에 필요한 Access Token을 가져옵니다.
   * @returns {Promise<string>} Access Token
   */
  private async getAccessToken() {
    if (!this.cid) {
      throw new ChzzkError(
        "InitError",
        "Chzzk must be initialized before getting access token"
      );
    }
    try {
      const accessTokenRequest = await this.client.get(
        ACCESS_TOKEN_URL + `?channelId=${this.cid}&chatType=STREAMING`
      );

      const accessTokenData = await accessTokenRequest.json();

      this.accessToken = accessTokenData.content.accessToken;

      return this.accessToken;
    } catch {
      throw new ChzzkError("FetchError", "Cannot fetch access token");
    }
  }

  /**
   * 치지직 소켓에 연결합니다.
   */
  public async connect() {
    if (this.accessToken == "" || this.cid == "") {
      throw new ChzzkError("InitError", "AccessToken or CID is not set");
    }

    const socket = new WebSocket(SOCKET_URL);

    this.socket = socket;

    socket.onopen = () => {
      const message = JSON.stringify({
        ver: VERSION,
        cmd: 100,
        svcid: SERVICE,
        cid: this.cid,
        tid: 1,
        bdy: {
          accessToken: this.accessToken,
          devType: DEV_TYPE,
          auth: "READ",
        },
      });

      socket.send(message);

      const response: Response = {
        error: false,
        message: "Connected to Chzzk Chat Server",
        code: "CHZZK_CONNECTED",
      };

      this.emit("connect", response);
    };

    socket.onmessage = (event: any) => {
      const data = JSON.parse(event.data);

      // 60000ms마다 치지직 소켓에서 connection유지 메시지를 보냄
      if (data.cmd == 0) {
        // connection keep alive
        const keepAliveMessage = JSON.stringify({
          ver: "2",
          cmd: 10000,
        });

        socket.send(keepAliveMessage);
      }

      // 치지직 후원메시지 수신 (일반메시지: 93101)
      if (data.cmd == 93102) {
        const message = JSON.parse(event.data) as Message;
        message.bdy.forEach((item) => {
          if (typeof item.profile === "string") {
            item.profile = JSON.parse(item.profile);
          }
          if (typeof item.extras === "string") {
            item.extras = JSON.parse(item.extras);
          }
        });

        if (!message.bdy[0].extras.payAmount) return; // 구독메시지 제외

        const response: DonationResponse = {
          error: false,
          message: "Receive donation message",
          code: "CHZZK_MESSAGE",
          channelId: message.bdy[0].extras.streamingChannelId,
          isAnonymous: message.bdy[0].extras.isAnonymous,
          nickname: message.bdy[0].extras.isAnonymous
            ? "익명의 후원자"
            : message.bdy[0].profile.nickname,
          amount: message.bdy[0].extras.payAmount,
          msg: message.bdy[0].msg,
          profile: message.bdy[0].profile,
        };

        this.emit("message", response);
      }
    };

    // 치지직 소켓 연결 종료되었을때
    socket.onclose = () => {
      const response: Response = {
        error: false,
        message: "Disconnected from Chzzk Chat Server",
        code: "CHZZK_DISCONNECTED",
      };

      this.emit("disconnect", response);
    };

    // 소켓 에러 발생시
    socket.onerror = (error) => {
      const response: Response = {
        error: true,
        message: "An error occurred while connecting to Chzzk Chat Server",
        code: "CHZZK_ERROR",
        errorDetail: error,
      };

      this.emit("error", response);
    };
  }

  /**
   * 치지직 채널 상세 정보를 가져옵니다.
   * @param channelId
   * @returns {Promise<any>} 치지직 채널 상세 정보
   */
  public async getLiveDetail(channelId: string) {
    try {
      const liveDetailRequest = await this.client.get(
        `https://api.chzzk.naver.com/service/v2/channels/${channelId}/live-detail`
      );

      const liveDetailData = await liveDetailRequest.json();

      this.cid = liveDetailData.content.chatChannelId;

      return liveDetailData;
    } catch {
      throw new ChzzkError("FetchError", "Cannot fetch channel detail");
    }
  }

  /**
   * 치지직 소켓 연결 종료
   * @returns {Promise<Response>}
   */
  public async disconnect() {
    // 초기화
    this.cid = "";
    this.accessToken = "";
    this.socket?.close();

    const response: Response = {
      error: false,
      message: "Receive disconnect from client",
      code: "CHZZK_DISCONNECTED",
    };

    this.emit("disconnect", response);
  }

  // 오버로딩
  public on(event: "connect", listener: (response: Response) => void): this;
  public on(event: "disconnect", listener: (response: Response) => void): this;
  public on(event: "error", listener: (response: Response) => void): this;
  // prettier-ignore
  public on(event: "message",listener: (message: DonationResponse) => void): this;
  public on(event: ChzzkEvent, listener: (response: any) => void): this {
    return super.on(event, listener);
  }
}

export default Chzzk;
