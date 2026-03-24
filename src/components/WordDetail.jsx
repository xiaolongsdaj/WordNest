import React, { useState, useEffect } from 'react';
import { Modal, Card, List, Typography, Tag, Button, message } from 'antd';
import { FileTextOutlined, BookOutlined } from '@ant-design/icons';
import db from '../services/db';

const { Title, Text, Paragraph } = Typography;

const WordDetail = ({ wordId, visible, onClose }) => {
  const [word, setWord] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && wordId) {
      loadWordDetails();
    }
  }, [visible, wordId]);

  const loadWordDetails = async () => {
    setLoading(true);
    try {
      // 加载单词详情
      const wordData = await db.getWordById(wordId);
      setWord(wordData);
    } catch (error) {
      message.error('加载单词详情失败');
      console.error('加载单词详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="单词详情"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      maskClosable={true}
    >
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Text>加载中...</Text>
        </div>
      ) : word ? (
      <div>
        <Card>
          <Title level={3}>{word.word}</Title>
          {word.phonetic && (
            <Paragraph>
              <Text strong>音标：</Text>{word.phonetic}
            </Paragraph>
          )}
          <Paragraph>
            <Text strong>释义：</Text>{word.meaning}
          </Paragraph>
          <Paragraph>
            <Text strong>标签：</Text>
            {word.tags.map(tag => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Paragraph>
          {/* <Paragraph>
            <Text strong>创建时间：</Text>{new Date(word.createdAt).toLocaleString()}
          </Paragraph>
          <Paragraph>
            <Text strong>更新时间：</Text>{new Date(word.updatedAt).toLocaleString()}
          </Paragraph> */}
        </Card>
      </div>
      ) : (
        <div className="flex justify-center items-center py-10">
          <Text>暂无数据</Text>
        </div>
      )}
    </Modal>
  );
};

export default WordDetail;