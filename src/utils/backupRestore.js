import db from '../services/db';

// 生成备份文件名
const generateBackupFileName = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `wordbook_backup_${year}${month}${day}_${hours}${minutes}${seconds}.json`;
};

// 导出数据为JSON文件
const exportData = async () => {
  try {
    const data = await db.exportData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateBackupFileName();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('导出数据失败:', error);
    return false;
  }
};

// 导入数据从JSON文件
const importData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        // 验证数据格式
        if (!data.words || !Array.isArray(data.words)) {
          reject(new Error('无效的数据格式：缺少words数组'));
          return;
        }
        await db.importData(data);
        resolve(true);
      } catch (error) {
        console.error('导入数据失败:', error);
        reject(error);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsText(file);
  });
};

// 检查数据库是否为空
const isDatabaseEmpty = async () => {
  try {
    const words = await db.getAllWords();
    const articles = await db.getAllArticles();
    return words.length === 0 && articles.length === 0;
  } catch (error) {
    console.error('检查数据库失败:', error);
    return true;
  }
};

export { exportData, importData, isDatabaseEmpty };