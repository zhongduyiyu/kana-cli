// 随机选项生成器
export function generateOptions(correctOption, allOptions, numOptions = 4) {
  const options = new Set([correctOption]);
  while (options.size < numOptions) {
    const randomOption = allOptions[Math.floor(Math.random() * allOptions.length)];
    options.add(randomOption);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
}