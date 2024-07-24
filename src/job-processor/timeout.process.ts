// timeout.process.ts
export async function timeoutProcess(): Promise<string> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('Process completed successfully.');
    }, 200000); // 20 seconds timeout
  });
  // return 'Process completed successfully.';
}

(async () => {
  const result = await timeoutProcess();
  if (process.send) {
    console.log('Sending completion message to parent process'); // 디버깅 로그 추가
    process.send({ status: 'completed', result });
  }
  process.exit(0);
})();
