// infinite-loop.process.ts
export async function infiniteLoop(): Promise<void> {
  return new Promise(() => {
    while (true) {
      console.log('This is an infinite loop.');
    }
  });
}

(async () => {
  await infiniteLoop();
  if (process.send) {
    console.log('Sending completion message to parent process'); // 디버깅 로그 추가
    process.send({ status: 'completed', result: 'Infinite loop completed' });
  }
  process.exit(0);
})();
