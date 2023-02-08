export const shuffle = (begin: number, end: number) => {
  return shuffleArray(Array.from({ length: end - begin }, (_, i) => begin + i));
};

// DON'T TOUCH: Durstenfeld shuffle
const shuffleArray = (array: number[]) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    let j = (Math.random() * (i + 1)) | 0;
    [result[i], result[j]] = [result[j] as number, result[i] as number];
  }
  return result;
};
