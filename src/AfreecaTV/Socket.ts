import https from "https";

// SSL 인증 비활성화 Agent
const agent = new https.Agent({
  rejectUnauthorized: false,
});

// WebSocket 연결옵션
const options = {
  agent, // SSL 인증 비활성화
  perMessageDeflate: false,
};

export default options;
