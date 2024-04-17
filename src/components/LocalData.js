export const largeArr = new Array(30_000_000).fill(0).map((_, i) => {
  return { index: i, isMine: i === 27_000_000 };
});
