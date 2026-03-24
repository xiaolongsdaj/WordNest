import React, { useState, useEffect } from 'react';
import { Button, List, Card, Typography, Modal, message, Input, Select } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import db from '../services/db';
import cet4Data from '../data/data.json';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const CET4Wordbook = () => {
  const [words, setWords] = useState([]);
  const [filteredWords, setFilteredWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const [existingWords, setExistingWords] = useState(new Set());

  // 加载四级单词数据
  useEffect(() => {
    setWords(cet4Data.words);
    setFilteredWords(cet4Data.words);
    loadExistingWords();
  }, []);

  // 加载现有单词，用于检查是否已添加
  const loadExistingWords = async () => {
    try {
      const userWords = await db.getAllWords();
      const wordSet = new Set(userWords.map(word => word.word.toLowerCase()));
      setExistingWords(wordSet);
    } catch (error) {
      console.error('加载现有单词失败:', error);
    }
  };

  // 搜索和过滤单词
  useEffect(() => {
    let result = words;

    // 按字母过滤
    if (selectedLetter) {
      result = result.filter(word => word.letter === selectedLetter);
    }

    // 按搜索词过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(word => 
        word.word.toLowerCase().includes(query) ||
        word.meaning.toLowerCase().includes(query)
      );
    }

    setFilteredWords(result);
  }, [words, searchQuery, selectedLetter]);

  // 查看单词详情
  const showWordDetail = (word) => {
    setSelectedWord(word);
    setIsDetailModalOpen(true);
  };

  // 添加到我的单词
  const addToMyWords = async (word) => {
    if (!word) return;

    try {
      // 检查是否已存在
      if (existingWords.has(word.word.toLowerCase())) {
        message.info('该单词已在你的单词库中');
        return;
      }

      // 创建单词对象
      const wordData = {
        word: word.word,
        phonetic: word.phonetic,
        meaning: word.meaning,
        tags: ['CET4'],
        isFavorite: false
      };

      await db.addWord(wordData);
      message.success('添加成功！');
      loadExistingWords(); // 刷新现有单词列表
    } catch (error) {
      message.error('添加失败');
      console.error('添加单词失败:', error);
    }
  };

  // 生成字母选项
  const letterOptions = Array.from(new Set(words.map(word => word.letter))).sort();

  return (
    <div className="p-5 bg-bg min-h-screen">
      {/* <div className="flex justify-between items-center mb-5 pb-2.5 border-b border-border">
        <div>
          <h2 className="m-0 text-text-h">四级词库</h2>
          <p className="text-text-secondary mt-1">共 {cet4Data.metadata.totalWords} 个单词</p>
        </div>
      </div> */}

      <div className="flex items-center mb-5 flex-wrap gap-2.5">
        <Search
          placeholder="搜索单词或释义"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 300, marginRight: 16 }}
          prefix={<SearchOutlined />}
        />
        <Select
          placeholder="按首字母筛选"
          value={selectedLetter}
          onChange={(value) => setSelectedLetter(value)}
          style={{ width: 120, marginRight: 16 }}
          allowClear
        >
          {letterOptions.map(letter => (
            <Option key={letter} value={letter}>{letter}</Option>
          ))}
        </Select>
      </div>

      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 4,
          xl: 5,
          xxl: 6,
        }}
        dataSource={filteredWords}
        loading={loading}
        pagination={{ pageSize: 20 }}
        renderItem={(word) => (
          <List.Item>
            <div style={{ position: 'relative' }}>
              {!existingWords.has(word.word.toLowerCase()) && (
                <Button 
                  key="add" 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToMyWords(word);
                  }}
                  style={{ 
                    position: 'absolute', 
                    top: '8px', 
                    right: '8px',
                    zIndex: 10
                  }}
                  size="small"
                >
                </Button>
              )}
              <Card 
                hoverable 
                className="cursor-pointer"
                onClick={() => showWordDetail(word)}
              >
                {existingWords.has(word.word.toLowerCase()) && (
                  <Text type="success" size="small" style={{ 
                    position: 'absolute', 
                    top: '8px', 
                    right: '8px',
                    zIndex: 10
                  }}>已添加</Text>
                )}
              <Card.Meta
                title={
                  <div className="flex justify-center items-center">
                    <span className="font-bold items-center">{word.word}</span>
                  </div>
                }
                description={
                  <div className="flex flex-col gap-1">
                    {word.phonetic && (
                      <Text type="secondary" className="text-sm">{word.phonetic}</Text>
                    )}
                    <Text className="text-sm">{word.meaning}</Text>
                  </div>
                }
              />
              </Card>
            </div>
          </List.Item>
        )}
      />

      {/* 单词详情模态框 */}
      <Modal
        title="单词详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          
        ]}
        width={500}
      >
        {selectedWord && (
          <div className="space-y-4">
            <div>
              <Text strong className="text-2xl">{selectedWord.word}</Text>
              {selectedWord.phonetic && (
                <Text type="secondary" className="ml-2">{selectedWord.phonetic}</Text>
              )}
            </div>
            <div>
              <Text className="block mb-1">释义：</Text>
              <Text>{selectedWord.meaning}</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CET4Wordbook;