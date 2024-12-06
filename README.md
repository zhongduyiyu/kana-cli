# Kana CLI

一个帮助学习日语假名的命令行工具，具有智能复习系统，基于艾宾浩斯遗忘曲线优化学习效果。（上班的时候总不可能打开浏览器学习吧～）

## 功能特点

- 📝 支持平假名和片假名的查询与练习
- 🔄 双向转换：假名与罗马字的互查
- 🎯 智能练习系统
  - 基于艾宾浩斯遗忘曲线安排复习
  - 针对性增加错误率高的题目出现频率
- 📊 练习统计功能（未开发完成）
- ⌨️ 便捷的快捷键操作

## 安装

1. 克隆仓库

```bash
git clone https://github.com/your-username/kana-cli.git
cd kana-cli
```

2. 安装依赖

```bash
npm install
```

3. 创建全局链接

```bash
npm link
```

现在你可以在任何目录下使用 `kana` 或者`kana-cli` 命令了。

## 数据存储

- 练习记录保存在 `kana-practice-history.json` 文件中
- 包含练习时间、答案正确性等详细信息
- 用于分析学习效果和安排复习计划

## 技术特点

- 基于 Node.js 开发
- 使用 inquirer.js 实现交互式命令行界面
- 实现艾宾浩斯遗忘曲线算法
- 支持练习数据持久化存储

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个工具。

## 许可证

MIT License
