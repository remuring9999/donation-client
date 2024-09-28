class CommandPacket {
  public command: string;
  public dataList: string[];
  public receivedTime: Date;

  constructor(args: string[]) {
    this.dataList = [...args]; // 배열 복사
    const cmd = this.dataList.shift() as string; // 첫 번째 항목을 제거하여 cmd에 저장
    this.command = cmd.substring(0, 4); // 명령어는 첫 4자리
    this.receivedTime = new Date(); // 현재 시간을 저장
  }
}

export default CommandPacket;
