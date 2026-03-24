/**
 * CET4 单词转换器
 * 将 CET4 单词表文本转换为 JSON 格式
 */

class CET4WordConverter {
  constructor() {
    this.config = {
      metadata: {
        name: "大学英语四级大纲单词表",
        level: "CET4",
        version: "1.0",
        source: "大学英语四级考试大纲",
      },
    };
  }

  /**
   * 解析单词文本
   * @param {string} text - 原始文本内容
   * @returns {Object} 解析结果对象
   */
  parseWords(text) {
    const cleanText = text.replace(/^\uFEFF/, "");
    const lines = cleanText.split(/\r?\n/);

    const words = [];
    let currentLetter = "";
    let index = 1;
    let totalMatched = 0;
    let unmatchedLines = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;

      // 检测字母标题
      if (/^[A-Z]$/.test(line) || /^[A-Z]\s/.test(line)) {
        currentLetter = line.charAt(0);
        console.log(`处理字母: ${currentLetter}`);
        continue;
      }

      // 跳过标题行
      if (
        line.includes("大学英语四级") ||
        line.includes("共") ||
        line.includes("词表") ||
        line.includes("大纲单词表")
      ) {
        continue;
      }

      let matched = false;

      // 特殊处理: 带重音符号的单词 (如 oˈclock)
      let match = line.match(/^([a-zA-Zˈ'()]+)\s+\[([^\]]+)\]\s+(.+)$/i);
      if (match) {
        words.push(
          this._createWord(
            index,
            match[1],
            `[${match[2]}]`,
            match[3],
            currentLetter,
          ),
        );
        index++;
        totalMatched++;
        matched = true;
        continue;
      }

      // 特殊处理: 带点的单词
      match = line.match(/^([a-z.]+)\s+(.+)$/i);
      if (match && (match[1].includes(".") || match[1].includes("("))) {
        words.push(
          this._createWord(index, match[1], "", match[2], currentLetter),
        );
        index++;
        totalMatched++;
        matched = true;
        continue;
      }

      // 特殊处理: i.e. 带音标
      match = line.match(/^([a-z.]+)\s+\[([^\]]+)\]\s+(.+)$/i);
      if (match && match[1].includes(".")) {
        words.push(
          this._createWord(
            index,
            match[1],
            `[${match[2]}]`,
            match[3],
            currentLetter,
          ),
        );
        index++;
        totalMatched++;
        matched = true;
        continue;
      }

      // 特殊处理: 单词和音标之间没有空格
      match = line.match(/^([a-z-]+)\[([^\]]+)\]\s+(.+)$/i);
      if (match) {
        words.push(
          this._createWord(
            index,
            match[1],
            `[${match[2]}]`,
            match[3],
            currentLetter,
          ),
        );
        index++;
        totalMatched++;
        matched = true;
        continue;
      }

      // 方法1: 标准格式
      match = line.match(/^([a-z-]+)\s+\[([^\]]+)\]\s+([a-z]+\.?)\s+(.+)$/i);
      if (match) {
        words.push(
          this._createWord(
            index,
            match[1],
            `[${match[2]}]`,
            match[4],
            currentLetter,
          ),
        );
        index++;
        totalMatched++;
        matched = true;
        continue;
      }

      // 方法2: 简化格式
      match = line.match(/^([a-z-]+)\s+\[([^\]]+)\]\s*(.+)$/i);
      if (match) {
        words.push(
          this._createWord(
            index,
            match[1],
            `[${match[2]}]`,
            match[3],
            currentLetter,
          ),
        );
        index++;
        totalMatched++;
        matched = true;
        continue;
      }

      // 方法3: 无音标
      match = line.match(/^([a-z-]+)\s+(.+)$/i);
      if (match && !match[1].includes("[") && !match[1].includes("]")) {
        words.push(
          this._createWord(index, match[1], "", match[2], currentLetter),
        );
        index++;
        totalMatched++;
        matched = true;
        continue;
      }

      // 记录未匹配的行
      if (!matched && line.length > 0 && !/^[A-Z]$/.test(line)) {
        unmatchedLines.push({ line: i + 1, content: line.substring(0, 100) });
      }
    }

    // 输出未匹配的行
    if (unmatchedLines.length > 0) {
      console.log("⚠️ 以下行未匹配成功：");
      unmatchedLines.forEach((item) => {
        console.log(`  行 ${item.line}: ${item.content}`);
      });
    } else {
      console.log("🎉 所有单词都匹配成功！");
    }

    return {
      words,
      totalMatched,
      unmatchedLines,
    };
  }

  /**
   * 创建单词对象
   * @private
   */
  _createWord(index, word, phonetic, meaning, letter) {
    return {
      id: `cet4_${String(index).padStart(4, "0")}`,
      word: word,
      phonetic: phonetic,
      meaning: meaning,
      index: index,
      letter: letter,
    };
  }

  /**
   * 从文件对象转换
   * @param {File} file - 文件对象
   * @returns {Promise<Object>} 转换后的 JSON 对象
   */
  async convertFromFile(file) {
    if (!file) {
      throw new Error("未提供文件");
    }

    const text = await file.text();
    const { words, totalMatched, unmatchedLines } = this.parseWords(text);

    const result = {
      metadata: {
        ...this.config.metadata,
        totalWords: words.length,
      },
      words: words,
    };

    console.log(`✅ 转换完成！共 ${words.length} 个单词`);
    console.log(`📊 统计: 总匹配 ${totalMatched} 个单词`);

    return result;
  }

  /**
   * 从文本字符串转换
   * @param {string} text - 文本内容
   * @returns {Object} 转换后的 JSON 对象
   */
  convertFromText(text) {
    const { words, totalMatched, unmatchedLines } = this.parseWords(text);

    const result = {
      metadata: {
        ...this.config.metadata,
        totalWords: words.length,
      },
      words: words,
    };

    console.log(`✅ 转换完成！共 ${words.length} 个单词`);
    console.log(`📊 统计: 总匹配 ${totalMatched} 个单词`);

    return result;
  }

  /**
   * 下载 JSON 文件
   * @param {Object} data - 要下载的数据
   * @param {string} filename - 文件名
   */
  downloadJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `cet4_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 创建文件选择器并转换
   * @returns {Promise<Object>} 转换结果
   */
  selectAndConvert() {
    return new Promise((resolve, reject) => {
      // 创建 input 元素
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt";

      input.onchange = async (e) => {
        try {
          const file = e.target.files[0];
          if (!file) {
            reject(new Error("未选择文件"));
            return;
          }

          const result = await this.convertFromFile(file);
          input.remove();
          resolve(result);
        } catch (error) {
          input.remove();
          reject(error);
        }
      };

      input.oncancel = () => {
        input.remove();
        reject(new Error("用户取消选择"));
      };

      // 触发文件选择
      input.click();
    });
  }
}

// 导出模块（支持多种模块系统）
if (typeof module !== "undefined" && module.exports) {
  module.exports = CET4WordConverter;
}

// 使用示例：
/*
// 方式1：使用文件选择器
const converter = new CET4WordConverter();
converter.selectAndConvert()
  .then(result => {
    console.log('转换结果:', result);
    // 下载文件
    converter.downloadJSON(result);
  })
  .catch(error => console.error('转换失败:', error));

// 方式2：从已有文本转换
const text = `A
abandon [əˈbændən] v. 抛弃，放弃
ability [əˈbɪləti] n. 能力，才能`;
const converter2 = new CET4WordConverter();
const result = converter2.convertFromText(text);
converter2.downloadJSON(result);

// 方式3：从 File 对象转换
const file = document.getElementById('fileInput').files[0];
const converter3 = new CET4WordConverter();
const result = await converter3.convertFromFile(file);
*/
