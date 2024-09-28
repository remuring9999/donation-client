import WebSocket from "ws";
import { EventEmitter } from "events";
import { Api } from "./Api";
import options from "./Socket";
import {
  CHAT_JOIN_PACKET,
  COMMAND_CHAT,
  COMMAND_DONE,
  COMMAND_ENTER,
  COMMAND_ENTER_FAN,
  CONNECT_PACKET,
  CONNECT_RES_PACKET,
  ESC,
  F,
  PING_PACKET,
} from "./Packet";
import CommandPacket from "./CommandPacket";
import {
  AfreecaConfig,
  AfreecaEvent,
  DonationResponse,
  Response,
} from "./types";
import { AfreecaError } from "./Error";

class AfreecaTV extends EventEmitter {
  private api: Api;
  private config: AfreecaConfig;
  private packetMap = new Map<string, CommandPacket>();
  private ws: WebSocket | null = null;
  public constructor() {
    super();
    this.api = new Api();
    this.config = {
      CHDOMAIN: "",
      CHATNO: "",
      FTK: "",
      TITLE: "",
      BJID: "",
      CHPT: null,
      BJNICK: "",
    };
  }

  public async init(bjId: string) {
    const data = await this.api.getPlayerLive(bjId);
    this.config = {
      CHDOMAIN: data.CHDOMAIN,
      CHATNO: data.CHATNO,
      FTK: data.FTK,
      TITLE: data.TITLE,
      BJID: data.BJID,
      CHPT: data.CHPT,
      BJNICK: data.BJNICK,
    };

    return data;
  }

  public async connect() {
    const { CHDOMAIN, CHATNO, FTK, TITLE, BJID, CHPT, BJNICK } = this.config;

    if (!CHDOMAIN || !CHATNO || !FTK || !TITLE || !BJID || !CHPT || !BJNICK) {
      throw new AfreecaError("InitError", "You must call init()");
    }

    const ws = new WebSocket(
      `wss://${CHDOMAIN}:${CHPT}/Websocket/${BJID}`,
      ["chat"],
      options
    );

    ws.on("open", () => {
      //최초 접속 패킷
      ws.send(Buffer.from(CONNECT_PACKET, "utf8"));

      //ping 패킷
      setInterval(() => {
        ws.send(Buffer.from(PING_PACKET, "utf8"));

        //메모리 최적화
        for (const [key, packet] of this.packetMap.entries()) {
          const now = new Date();
          if (packet.receivedTime.getTime() < now.getTime() - 60 * 60 * 1000) {
            this.packetMap.delete(key);
          }
        }
      }, 59996);

      this.ws = ws;
    });

    ws.on("message", (data) => {
      const message = data.toString("utf8");

      if (message == CONNECT_RES_PACKET) {
        //채팅방 입장 패킷
        ws.send(Buffer.from(CHAT_JOIN_PACKET(CHATNO), "utf8"));
      }

      try {
        // 패킷 분석
        const packet = new CommandPacket(message.replace(ESC, "").split(F));

        const cmd = packet.command;

        let dataList;
        switch (cmd) {
          case COMMAND_ENTER:
          case COMMAND_ENTER_FAN:
            dataList = null;
            break;
          default:
            dataList = packet.dataList;
        }

        if (!dataList) {
          return;
        }

        let msg = null;
        let nickname = null;
        let payAmount = 0;

        // 후원 패킷
        if (cmd === COMMAND_DONE) {
          this.packetMap.set(dataList[2], packet);
        } else if (cmd === COMMAND_CHAT) {
          // 후원 메시지
          const nick = dataList[5];
          if (this.packetMap.has(nick)) {
            // 후원 패킷이 존재하면
            const donePacket = this.packetMap.get(nick);
            if (!donePacket) return;

            msg = dataList[0];
            nickname = donePacket.dataList[2];
            payAmount = parseInt(donePacket.dataList[3], 10);

            this.packetMap.delete(nick);
          } else {
            return;
          }
        } else {
          return;
        }

        if (!msg || !nickname || payAmount == 0) {
          return;
        }

        const response: DonationResponse = {
          error: false,
          message: "Receive donation message",
          code: "AFREECATV_MESSAGE",
          bjid: BJID,
          nickname: nickname,
          amount: payAmount,
          msg: msg,
        };

        this.emit("message", response);
      } catch {
        throw new AfreecaError("PacketError", "Packet parsing error");
      }
    });

    ws.on("error", (error) => {
      const response: Response = {
        error: true,
        message: error.message,
        code: "AFREECATV_ERROR",
        errorDetail: error,
      };

      this.emit("error", response);
    });

    ws.on("close", () => {
      const response: Response = {
        error: false,
        message: "Disconnected from AfreecaTV Chat Server",
        code: "AFREECATV_DISCONNECTED",
      };

      this.emit("disconnect", response);
    });
  }

  // 오버로딩
  public on(event: "connect", listener: (response: Response) => void): this;
  public on(event: "disconnect", listener: (response: Response) => void): this;
  public on(event: "error", listener: (response: Response) => void): this;
  // prettier-ignore
  public on(event: "message",listener: (message: DonationResponse) => void): this;
  public on(event: AfreecaEvent, listener: (response: any) => void): this {
    return super.on(event, listener);
  }
}

export default AfreecaTV;
