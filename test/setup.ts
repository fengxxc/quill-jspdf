// 全局测试设置
global.console = {
  ...console,
  // 禁用控制台警告或控制台错误以保持测试输出干净
  // warn: jest.fn(),
  // error: jest.fn(),
};
