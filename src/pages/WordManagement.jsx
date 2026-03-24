import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Modal, Form, message, Tag, Card, List } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import db from '../services/db';
import WordDetail from '../components/WordDetail';

const { Option } = Select;
const { Search } = Input;

const WordManagement = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [selectedWordId, setSelectedWordId] = useState(null);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    tag: ''
  });

  // 加载单词列表
  useEffect(() => {
    loadWords();
  }, [searchQuery, filters]);

  const loadWords = async () => {
    setLoading(true);
    try {
      let allWords = await db.getAllWords();

      // 搜索过滤
      if (searchQuery) {
        allWords = allWords.filter(word => 
          word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
          word.meaning.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // 标签过滤
      if (filters.tag) {
        allWords = allWords.filter(word => word.tags.includes(filters.tag));
      }

      setWords(allWords);
    } catch (error) {
      message.error('加载单词失败');
      console.error('加载单词失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 打开添加单词模态框
  const showAddModal = () => {
    setEditingWord(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // 打开编辑单词模态框
  const showEditModal = (word) => {
    setEditingWord(word);
    const { partOfSpeech, ...wordWithoutPartOfSpeech } = word;
    form.setFieldsValue({
      ...wordWithoutPartOfSpeech,
      tags: word.tags.join(',')
    });
    setIsModalOpen(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // 提交表单
  const handleSubmit = async (values) => {
    try {
      const wordData = {
        ...values,
        tags: values.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (editingWord) {
        // 编辑单词
        await db.updateWord(editingWord.id, wordData);
        message.success('单词更新成功');
      } else {
        // 添加单词
        await db.addWord(wordData);
        message.success('单词添加成功');
      }

      setIsModalOpen(false);
      loadWords();
    } catch (error) {
      message.error('操作失败');
      console.error('操作失败:', error);
      setIsModalOpen(false);
    }
  };

  // 删除单词
  const handleDelete = async (word) => {
    try {
      await db.deleteWord(word.id);
      message.success('单词删除成功');
      loadWords();
    } catch (error) {
      message.error('删除失败');
      console.error('删除失败:', error);
    }
  };

  // 查看单词详情
  const showWordDetail = (word) => {
    setSelectedWordId(word.id);
    setIsDetailModalOpen(true);
  };

  // 表格列定义
  const columns = [
    {
      title: '单词',
      dataIndex: 'word',
      key: 'word',
      sorter: (a, b) => a.word.localeCompare(b.word)
    },
    {
      title: '词性',
      dataIndex: 'partOfSpeech',
      key: 'partOfSpeech'
    },
    {
      title: '释义',
      dataIndex: 'meaning',
      key: 'meaning',
      ellipsis: true
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => (
        <div>
          {tags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      )
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      sorter: (a, b) => a.difficulty - b.difficulty
    },
    {
      title: '掌握程度',
      dataIndex: 'mastery',
      key: 'mastery',
      sorter: (a, b) => a.mastery - b.mastery,
      render: (mastery) => `${mastery}%`
    },
    {
      title: '复习次数',
      dataIndex: 'reviewCount',
      key: 'reviewCount',
      sorter: (a, b) => a.reviewCount - b.reviewCount
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
            className="mr-2"
          />
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => handleDelete(record)}
          />
        </div>
      )
    }
  ];

  return (
    <div className="p-5 bg-bg min-h-screen">
      {/* <div className="flex justify-between items-center mb-5 pb-2.5 border-b border-border">
        <h2 className="m-0 text-text-h">单词管理</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showAddModal}
          className="mb-5"
        >
          添加单词
        </Button>
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
          placeholder="按标签筛选"
          value={filters.tag}
          onChange={(value) => setFilters({ ...filters, tag: value })}
          style={{ width: 150, marginRight: 16 }}
          allowClear
        >
          {/* 动态生成标签选项 */}
          {Array.from(new Set(words.flatMap(word => word.tags))).map(tag => (
            <Option key={tag} value={tag}>{tag}</Option>
          ))}
        </Select>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showAddModal}
          // className="mr-5"
          // style={{ width: 300, marginRight: 16 }}
        >
        </Button>
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
        dataSource={words}
        loading={loading}
        pagination={{ pageSize: 12 }}
        renderItem={(word) => (
          <List.Item>
            <Card 
              hoverable 
              className="cursor-pointer" 
              onClick={() => showWordDetail(word)}
              actions={[
                <Button 
                  key="edit" 
                  icon={<EditOutlined />} 
                  onClick={(e) => {
                    e.stopPropagation();
                    showEditModal(word);
                  }}
                />,
                <Button 
                  key="delete" 
                  icon={<DeleteOutlined />} 
                  danger 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(word);
                  }}
                />
              ]}
            >
              <Card.Meta
                title={word.word}
                description={
                  <div className="flex flex-col gap-2">
                    <div>释义: {word.meaning}</div>
                    <div>
                      标签: {word.tags.map(tag => (
                        <Tag key={tag} className="mr-1">{tag}</Tag>
                      ))}
                    </div>
                  </div>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title={editingWord ? '编辑单词' : '添加单词'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="word"
            label="单词"
            rules={[{ required: true, message: '请输入单词' }]}
          >
            <Input placeholder="请输入单词" />
          </Form.Item>

          <Form.Item
            name="meaning"
            label="中文释义"
            rules={[{ required: true, message: '请输入中文释义' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入中文释义" />
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签"
            rules={[{ required: true, message: '请输入标签' }]}
          >
            <Input placeholder="请输入标签，用逗号分隔" />
          </Form.Item>

          <Form.Item className="flex justify-end gap-2.5 mt-5">
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" htmlType="submit">
              {editingWord ? '更新' : '添加'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <WordDetail
        wordId={selectedWordId}
        visible={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
};

export default WordManagement;