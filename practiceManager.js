import fs from "fs/promises";
import path from "path";

const PRACTICE_HISTORY_FILE = "kana-practice-history.json";
const REVIEW_INTERVALS = [
  1, // 1天后复习
  2, // 2天后复习
  4, // 4天后复习
  7, // 1周后复习
  15, // 15天后复习
  30 // 1月后复习
];

class PracticeManager {
  constructor() {
    this.history = [];
    this.loadHistory();
  }

  async loadHistory() {
    try {
      const data = await fs.readFile(PRACTICE_HISTORY_FILE, "utf8");
      this.history = JSON.parse(data);
    } catch (error) {
      this.history = [];
      await this.saveHistory();
    }
  }

  async saveHistory() {
    await fs.writeFile(PRACTICE_HISTORY_FILE, JSON.stringify(this.history, null, 2));
  }

  async recordPractice(item, answer, isCorrect, type) {
    const record = {
      reading: item.reading,
      hiragana: item.hiragana,
      katakana: item.katakana,
      type,
      answer,
      isCorrect,
      timestamp: Date.now()
    };
    this.history.push(record);
    await this.saveHistory();
  }

  getItemScore(item, type) {
    const records = this.history.filter((r) => r.reading === item.reading && r.type === type);

    if (records.length === 0) return 100; // 新题目优先级高

    // 计算错误率
    const recentRecords = records.slice(-10); // 只看最近10次
    const errorRate = recentRecords.filter((r) => !r.isCorrect).length / recentRecords.length;

    // 计算最后一次练习距今的天数
    const lastPracticeDay = (Date.now() - records[records.length - 1].timestamp) / (1000 * 60 * 60 * 24);

    // 查找下一个复习时间点
    const lastCorrectIndex = records.findIndex((r) => r.isCorrect);
    const practiceCount = lastCorrectIndex === -1 ? 0 : lastCorrectIndex + 1;
    const nextReviewDay =
      REVIEW_INTERVALS[Math.min(practiceCount, REVIEW_INTERVALS.length - 1)] ||
      REVIEW_INTERVALS[REVIEW_INTERVALS.length - 1];

    // 计算复习优先级
    const reviewUrgency = Math.max(0, lastPracticeDay - nextReviewDay) * 20;

    // 综合分数：错误率 * 40 + 复习紧迫性 * 60
    return errorRate * 40 + reviewUrgency * 60;
  }

  isFrequentlyWrong(item, type) {
    const records = this.history.filter((r) => r.reading === item.reading && r.type === type);

    // 如果练习次数少于5次，不算作常错题
    if (records.length < 5) return false;

    // 取最近10次或全部记录中较小的数量
    const recentRecords = records.slice(-Math.min(10, records.length));
    const errorRate = recentRecords.filter((r) => !r.isCorrect).length / recentRecords.length;

    // 错误率大于40%认为是常错题
    return errorRate > 0.4;
  }

  needsReview(item, type) {
    const records = this.history.filter((r) => r.reading === item.reading && r.type === type);

    if (records.length === 0) return false;

    // 获取最后一次正确答题的记录
    const lastCorrectRecord = [...records].reverse().find((r) => r.isCorrect);
    if (!lastCorrectRecord) return false;

    // 计算距离上次正确的天数
    const daysSinceLastCorrect = (Date.now() - lastCorrectRecord.timestamp) / (1000 * 60 * 60 * 24);

    // 获取应该复习的间隔
    const practiceCount = records.filter((r) => r.isCorrect).length;
    const nextReviewDay =
      REVIEW_INTERVALS[Math.min(practiceCount - 1, REVIEW_INTERVALS.length - 1)] || REVIEW_INTERVALS[0];

    // 如果超过复习时间，需要复习
    return daysSinceLastCorrect >= nextReviewDay;
  }

  selectNextItem(items, type) {
    // 将题目分类
    const frequentlyWrong = items.filter((item) => this.isFrequentlyWrong(item, type));
    const needsReview = items.filter((item) => !this.isFrequentlyWrong(item, type) && this.needsReview(item, type));
    const remaining = items.filter((item) => !this.isFrequentlyWrong(item, type) && !this.needsReview(item, type));

    // 根据概率选择类别
    const rand = Math.random() * 100;
    let selectedPool;

    if (rand < 40 && frequentlyWrong.length > 0) {
      // 40% 概率选择常错题
      selectedPool = frequentlyWrong;
    } else if (rand < 70 && needsReview.length > 0) {
      // 30% 概率选择需要复习的题
      selectedPool = needsReview;
    } else {
      // 30% 概率选择其他题，或当其他池为空时
      selectedPool = remaining.length > 0 ? remaining : items;
    }

    // 在选中的题目池中随机选择一题
    return selectedPool[Math.floor(Math.random() * selectedPool.length)];
  }

  // 添加一个方法来获取练习统计信息
  getStatistics(type) {
    return {
      totalPracticed: this.history.filter((r) => r.type === type).length,
      frequentlyWrongCount: this.history.filter(
        (r) => r.type === type && this.isFrequentlyWrong({ reading: r.reading, type }, type)
      ).length,
      needsReviewCount: this.history.filter(
        (r) => r.type === type && this.needsReview({ reading: r.reading, type }, type)
      ).length,
      averageAccuracy:
        this.history.filter((r) => r.type === type).reduce((acc, curr) => acc + (curr.isCorrect ? 1 : 0), 0) /
          this.history.filter((r) => r.type === type).length || 0
    };
  }
}

export const practiceManager = new PracticeManager();
