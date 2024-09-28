import { AfreecaConfig } from "./types";
import httpClient from "../Requests/httpClient";
import { AfreecaError } from "./Error";

export class Api {
  private client: httpClient;
  private requestOptions: RequestInit = {};

  public constructor(requestOptions?: RequestInit) {
    if (requestOptions) this.requestOptions = requestOptions;
    this.requestOptions.headers = {
      "User-Agent": "Mozilla",
    };
    this.client = new httpClient(this.requestOptions);
  }

  public async getPlayerLive(BID: string): Promise<AfreecaConfig> {
    try {
      const LiveDataRequest = await this.client.post(
        `https://live.afreecatv.com/afreeca/player_live_api.php?bjid=${BID}`,
        new URLSearchParams({
          bid: BID,
          type: "live",
          confirm_adult: "false",
          player_type: "html5",
          mode: "landing",
          from_api: "0",
          pwd: "",
          stream_type: "common",
          quality: "HD",
        })
      );

      const response = await LiveDataRequest.json();

      const channelData = response.CHANNEL;

      if (!channelData.CHDOMAIN) {
        throw new AfreecaError(
          "InitError",
          "AfreecaTV Class must be initialized before getting live data"
        );
      }

      return {
        CHDOMAIN: channelData.CHDOMAIN.toLowerCase(),
        CHATNO: channelData.CHATNO,
        FTK: channelData.FTK,
        TITLE: channelData.TITLE,
        BJID: channelData.BJID,
        CHPT: Number(channelData.CHPT) + 1,
        BJNICK: channelData.BJNICK,
      };
    } catch {
      throw new AfreecaError(
        "FetchError",
        "Could not fetch Live Data from AfreecaTV API"
      );
    }
  }
}
