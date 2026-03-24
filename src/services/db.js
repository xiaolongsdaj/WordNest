import Dexie from "dexie";

class WordBookDB extends Dexie {
  constructor() {
    super("WordBookDB");
    this.version(2).stores({
      words:
        "id, word, meaning, tags, createdAt, updatedAt, isDeleted, isFavorite, phonetic",
      articles:
        "id, title, content, source, wordCount, tags, isFavorite, createdAt, updatedAt, isDeleted",
    });
  }

  // 单词相关操作
  async addWord(word) {
    try {
      return await this.words.add({
        ...word,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      });
    } catch (error) {
      console.error("添加单词失败:", error);
      throw error;
    }
  }

  async updateWord(id, updates) {
    return await this.words.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  async deleteWord(id) {
    return await this.words.update(id, {
      isDeleted: true,
      updatedAt: new Date(),
    });
  }

  async getAllWords() {
    try {
      return await this.words.filter((word) => !word.isDeleted).toArray();
    } catch (error) {
      console.error("获取所有单词失败:", error);
      return [];
    }
  }

  async getWordById(id) {
    try {
      return await this.words.get(id);
    } catch (error) {
      console.error("根据ID获取单词失败:", error);
      return null;
    }
  }

  async searchWords(query) {
    try {
      return await this.words
        .filter(
          (word) =>
            !word.isDeleted &&
            (word.word.toLowerCase().includes(query.toLowerCase()) ||
              word.meaning.toLowerCase().includes(query.toLowerCase())),
        )
        .toArray();
    } catch (error) {
      console.error("搜索单词失败:", error);
      return [];
    }
  }

  // 文章相关操作
  async addArticle(article) {
    try {
      return await this.articles.add({
        ...article,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      });
    } catch (error) {
      console.error("添加文章失败:", error);
      throw error;
    }
  }

  async updateArticle(id, updates) {
    try {
      return await this.articles.update(id, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("更新文章失败:", error);
      throw error;
    }
  }

  async deleteArticle(id) {
    try {
      return await this.articles.update(id, {
        isDeleted: true,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("删除文章失败:", error);
      throw error;
    }
  }

  async getAllArticles() {
    try {
      return await this.articles
        .filter((article) => !article.isDeleted)
        .toArray();
    } catch (error) {
      console.error("获取所有文章失败:", error);
      return [];
    }
  }

  async getArticleById(id) {
    try {
      return await this.articles.get(id);
    } catch (error) {
      console.error("根据ID获取文章失败:", error);
      return null;
    }
  }

  async searchArticles(query) {
    try {
      return await this.articles
        .filter(
          (article) =>
            !article.isDeleted &&
            (article.title.toLowerCase().includes(query.toLowerCase()) ||
              article.content.toLowerCase().includes(query.toLowerCase())),
        )
        .toArray();
    } catch (error) {
      console.error("搜索文章失败:", error);
      return [];
    }
  }

  // 备份与恢复
  async exportData() {
    try {
      const words = await this.getAllWords();
      const articles = await this.getAllArticles();

      return {
        words,
        articles,
        settings: {
          theme: localStorage.getItem("theme") || "light",
        },
      };
    } catch (error) {
      console.error("导出数据失败:", error);
      return {
        words: [],
        articles: [],
        settings: {
          theme: localStorage.getItem("theme") || "light",
        },
      };
    }
  }

  async importData(data) {
    try {
      // 清空现有数据
      await this.words.clear();
      await this.articles.clear();

      // 导入数据
      if (data.words) {
        for (const word of data.words) {
          await this.words.add(word);
        }
      }

      if (data.articles) {
        for (const article of data.articles) {
          await this.articles.add(article);
        }
      }

      if (data.settings && data.settings.theme) {
        localStorage.setItem("theme", data.settings.theme);
      }
    } catch (error) {
      console.error("导入数据失败:", error);
      throw error;
    }
  }
}

const db = new WordBookDB();
export default db;
