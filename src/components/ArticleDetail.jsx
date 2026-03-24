import React, { useState, useEffect } from 'react';
import { Modal, Card, List, Typography, Tag, Button, message, Divider } from 'antd';
import { BookOutlined, FileTextOutlined } from '@ant-design/icons';
import db from '../services/db';

const { Title, Text, Paragraph } = Typography;

const ArticleDetail = ({ articleId, visible, onClose }) => {
  const [article, setArticle] = useState(null);
  const [relatedWords, setRelatedWords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && articleId) {
      loadArticleDetails();
    }
  }, [visible, articleId]);

  const loadArticleDetails = async () => {
    setLoading(true);
    try {
      // 加载文章详情
      const articleData = await db.getArticleById(articleId);
      setArticle(articleData);

      // 加载关联的单词
      if (articleData) {
        const relations = await db.getRelationsByArticleId(articleId);
        const wordIds = relations.map(relation => relation.wordId);
        const words = [];

        for (const wordId of wordIds) {
          const word = await db.getWordById(wordId);
          if (word) {
            words.push(word);
          }
        }

        setRelatedWords(words);
      }
    } catch (error) {
      message.error('加载文章详情失败');
      console.error('加载文章详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="文章详情"
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
      ) : article ? (
      <div>
        <Card>
          <Title level={3}>{article.title}</Title>
          <Paragraph>
            <Text strong>来源：</Text>{article.source}
          </Paragraph>
          <Paragraph>
            <Text strong>单词数：</Text>{article.wordCount}
          </Paragraph>
          {/* <Paragraph>
            <Text strong>难度等级：</Text>{article.difficulty}
          </Paragraph> */}
          <Paragraph>
            <Text strong>标签：</Text>
            {article.tags.map(tag => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Paragraph>
          {/* <Paragraph>
            <Text strong>收藏：</Text>{article.isFavorite ? '是' : '否'}
          </Paragraph>
          <Paragraph>
            <Text strong>创建时间：</Text>{new Date(article.createdAt).toLocaleString()}
          </Paragraph>
          <Paragraph>
            <Text strong>更新时间：</Text>{new Date(article.updatedAt).toLocaleString()}
          </Paragraph> */}
          <Divider />
          <Title level={4}>文章内容</Title>
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </Card>

        {/* <div className="related-words mt-5">
          <Title level={4} icon={<BookOutlined />}>包含的单词</Title>
          {relatedWords.length > 0 ? (
            <List
              itemLayout="vertical"
              dataSource={relatedWords}
              renderItem={(word) => (
                <List.Item>
                  <Card size="small">
                    <div className="word-item">
                      <Text strong>{word.word}</Text>
                      <Text type="secondary">{word.partOfSpeech}</Text>
                      <Text type="secondary">{word.meaning}</Text>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Text type="secondary">暂无关联单词</Text>
          )}
        </div> */}
      </div>
      ) : (
        <div className="flex justify-center items-center py-10">
          <Text>暂无数据</Text>
        </div>
      )}
    </Modal>
  );
};

export default ArticleDetail;