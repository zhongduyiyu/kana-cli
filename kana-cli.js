#!/usr/bin/env node

import inquirer from "inquirer";
import readline from "readline";
import fiftySounds from "./fiftySounds.js";
import { generateOptions } from "./utils.js";
import { ACTION_TYPE, ACTION_TYPE_LABEL_ZHCN } from "./enum.js";
import { practiceManager } from './practiceManager.js';

// 创建 readline 接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 启用 raw 模式捕获按键
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

// 全局快捷键监听
function setupGlobalShortcut(mainMenuCallback) {
  process.stdin.on("keypress", (str, key) => {
    if (key.ctrl && key.name === "q") {
      console.log("\n检测到 Ctrl + Q，返回主菜单...\n");
      mainMenuCallback(); // 调用主菜单
    }
  });
}

// 主菜单
async function mainMenu() {
  console.clear();
  console.log("提示：在任何时候按 'ctrl + q' 可返回主菜单。\n");
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "请选择一个操作：",
      choices: [
        {
          name: ACTION_TYPE_LABEL_ZHCN[ACTION_TYPE.KANA_TO_READING],
          value: ACTION_TYPE.KANA_TO_READING
        },
        {
          name: ACTION_TYPE_LABEL_ZHCN[ACTION_TYPE.READING_TO_KANA],
          value: ACTION_TYPE.READING_TO_KANA
        },
        {
          name: ACTION_TYPE_LABEL_ZHCN[ACTION_TYPE.HIRAGANA_TO_KATAKANA],
          value: ACTION_TYPE.HIRAGANA_TO_KATAKANA
        },
        {
          name: ACTION_TYPE_LABEL_ZHCN[ACTION_TYPE.KATAKANA_TO_HIRAGANA],
          value: ACTION_TYPE.KATAKANA_TO_HIRAGANA
        },
        {
          name: ACTION_TYPE_LABEL_ZHCN[ACTION_TYPE.QUERY_KANA_TO_READING],
          value: ACTION_TYPE.QUERY_KANA_TO_READING
        },
        {
          name: ACTION_TYPE_LABEL_ZHCN[ACTION_TYPE.QUERY_READING_TO_KANA],
          value: ACTION_TYPE.QUERY_READING_TO_KANA
        },
        {
          name: ACTION_TYPE_LABEL_ZHCN[ACTION_TYPE.QUERY_HIRAGANA_TO_KATAKANA],
          value: ACTION_TYPE.QUERY_HIRAGANA_TO_KATAKANA
        },
        {
          name: ACTION_TYPE_LABEL_ZHCN[ACTION_TYPE.QUERY_KATAKANA_TO_HIRAGANA],
          value: ACTION_TYPE.QUERY_KATAKANA_TO_HIRAGANA
        },
        {
          name: "退出",
          value: 0
        }
      ]
    }
  ]);

  switch (action) {
    case ACTION_TYPE.QUERY_READING_TO_KANA:
      await queryReadingToKana();
      break;
    case ACTION_TYPE.QUERY_HIRAGANA_TO_KATAKANA:
      await queryHiraganaToKatakana();
      break;
    case ACTION_TYPE.QUERY_KATAKANA_TO_HIRAGANA:
      await queryKatakanaToHiragana();
      break;
    case ACTION_TYPE.QUERY_KANA_TO_READING:
      await queryKanaToReading();
      break;
    case ACTION_TYPE.HIRAGANA_TO_KATAKANA:
      await exerciseHiraganaToKatakana();
      break;
    case ACTION_TYPE.KATAKANA_TO_HIRAGANA:
      await exerciseKatakanaToHiragana();
      break;
    case ACTION_TYPE.READING_TO_KANA:
      await exerciseReadingToKana();
      break;
    case ACTION_TYPE.KANA_TO_READING:
      await exerciseKanaToReading();
      break;
    case 0:
      console.log("感谢kana-cli！");
      process.exit(0);
  }

  await mainMenu();
}

// 功能实现
async function queryReadingToKana() {
  const { reading } = await inquirer.prompt([
    { type: "input", name: "reading", message: "请输入读音（罗马字）：例如 'a'" }
  ]);
  const result = fiftySounds.find((item) => item.reading === reading);
  if (result) {
    console.log(`读音 "${reading}" 对应：平假名 "${result.hiragana}"，片假名 "${result.katakana}"`);
  } else {
    console.log("未找到对应的假名！");
  }
  await postActionMenu(queryReadingToKana);
}

async function queryHiraganaToKatakana() {
  const { hiragana } = await inquirer.prompt([{ type: "input", name: "hiragana", message: "请输入平假名：" }]);
  const result = fiftySounds.find((item) => item.hiragana === hiragana);
  if (result) {
    console.log(`平假名 "${hiragana}" 对应片假名：${result.katakana}`);
  } else {
    console.log("未找到对应的片假名！");
  }
  await postActionMenu(queryHiraganaToKatakana);
}

async function queryKatakanaToHiragana() {
  const { katakana } = await inquirer.prompt([{ type: "input", name: "katakana", message: "请输入片假名：" }]);
  const result = fiftySounds.find((item) => item.katakana === katakana);
  if (result) {
    console.log(`片假名 "${katakana}" 对应平假名：${result.hiragana}`);
  } else {
    console.log("未找到对应的平假名！");
  }
  await postActionMenu(queryKatakanaToHiragana);
}

async function queryKanaToReading() {
  const { kana } = await inquirer.prompt([{ type: "input", name: "kana", message: "请输入平假名或片假名：" }]);
  const result = fiftySounds.find((item) => item.hiragana === kana || item.katakana === kana);
  if (result) {
    console.log(`假名 "${kana}" 对应读音：${result.reading}`);
  } else {
    console.log("未找到对应的读音！");
  }
  await postActionMenu(queryKanaToReading);
}

async function exerciseHiraganaToKatakana() {
  const randomItem = practiceManager.selectNextItem(fiftySounds, ACTION_TYPE.HIRAGANA_TO_KATAKANA);
  const options = generateOptions(
    randomItem.katakana,
    fiftySounds.map((item) => item.katakana)
  );
  const { answer } = await inquirer.prompt([
    {
      type: "list",
      name: "answer",
      message: `请选择平假名 "${randomItem.hiragana}" 对应的片假名：`,
      choices: options
    }
  ]);
  if (answer === randomItem.katakana) {
    console.log("✅ 正确！");
  } else {
    console.log(`❌ 错误！正确答案是：${randomItem.katakana}`);
  }
  await practiceManager.recordPractice(randomItem, answer, answer === randomItem.katakana, ACTION_TYPE.HIRAGANA_TO_KATAKANA);
  await postActionMenu(exerciseHiraganaToKatakana);
}

async function exerciseKatakanaToHiragana() {
  const randomItem = practiceManager.selectNextItem(fiftySounds, ACTION_TYPE.KATAKANA_TO_HIRAGANA);
  const options = generateOptions(
    randomItem.hiragana,
    fiftySounds.map((item) => item.hiragana)
  );
  const { answer } = await inquirer.prompt([
    {
      type: "list",
      name: "answer",
      message: `请选择片假名 "${randomItem.katakana}" 对应的平假名：`,
      choices: options
    }
  ]);
  if (answer === randomItem.hiragana) {
    console.log("✅ 正确！");
  } else {
    console.log(`❌ 错误！正确答案是：${randomItem.hiragana}`);
  }
  await practiceManager.recordPractice(randomItem, answer, answer === randomItem.hiragana, ACTION_TYPE.KATAKANA_TO_HIRAGANA);
  await postActionMenu(exerciseKatakanaToHiragana);
}

// 给一个读音，让用户选择正确的平假名或片假名
async function exerciseReadingToKana() {
  const randomItem = practiceManager.selectNextItem(fiftySounds, ACTION_TYPE.READING_TO_KANA);
  const options = generateOptions(
    randomItem.hiragana,
    fiftySounds.map((item) => item.hiragana)
  );
  const { answer } = await inquirer.prompt([
    {
      type: "list",
      name: "answer",
      message: `请选择读音 "${randomItem.reading}" 对应的平假名：`,
      choices: options
    }
  ]);

  process.stdout.moveCursor(0, -1);
  process.stdout.clearLine(1);

  if (answer === randomItem.hiragana) {
    console.log(`✅ 正确！（${randomItem.hiragana}）`);
  } else {
    console.log(`❌ 错误！正确答案是：${randomItem.hiragana}`);
  }

  await practiceManager.recordPractice(randomItem, answer, answer === randomItem.hiragana, ACTION_TYPE.READING_TO_KANA);
  await postActionMenu(exerciseReadingToKana);
}
// 给一个假名，让用户选择正确的读音
async function exerciseKanaToReading() {
  const randomItem = practiceManager.selectNextItem(fiftySounds, ACTION_TYPE.KANA_TO_READING);
  const options = generateOptions(
    randomItem.reading,
    fiftySounds.map((item) => item.reading)
  );
  const { answer } = await inquirer.prompt([
    {
      type: "list",
      name: "answer",
      message: `请选择假名 "${randomItem.hiragana}" 对应的读音：`,
      choices: options
    }
  ]);
  if (answer === randomItem.reading) {
    console.log("✅ 正确！");
  } else {
    console.log(`❌ 错误！正确答案是：${randomItem.reading}`);
  }
  await practiceManager.recordPractice(randomItem, answer, answer === randomItem.reading, ACTION_TYPE.KANA_TO_READING);
  await postActionMenu(exerciseKanaToReading);
}

async function postActionMenu(currentAction) {
  await currentAction();
}

setupGlobalShortcut(mainMenu); // 启用全局快捷键
// 启动程序
mainMenu();

// 统计信息
async function showStatistics(type) {
  const stats = practiceManager.getStatistics(type);
  console.log('\n练习统计：');
  console.log(`总练习次数: ${stats.totalPracticed}`);
  console.log(`当前常错题数量: ${stats.frequentlyWrongCount}`);
  console.log(`需要复习的题目: ${stats.needsReviewCount}`);
  console.log(`平均正确率: ${(stats.averageAccuracy * 100).toFixed(1)}%\n`);
}
