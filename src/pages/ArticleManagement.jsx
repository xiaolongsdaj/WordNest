import React, { useState, useEffect } from 'react';
import { Button, Table, Input, Select, Modal, Form, message, Tag, Switch, List, Checkbox, Divider, Card, Typography, Alert, Dropdown, Menu } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, StarOutlined, EyeOutlined, ImportOutlined, BoldOutlined, ItalicOutlined, UnderlineOutlined, LinkOutlined, OrderedListOutlined, UnorderedListOutlined, DownOutlined } from '@ant-design/icons';
import ArticleDetail from '../components/ArticleDetail';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import db from '../services/db';

const { TextArea } = Input;
const { Title, Text } = Typography;

// 常见停用词列表
const stopWords = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'as', 'into', 'like',
  'through', 'after', 'over', 'between', 'out', 'against', 'during', 'before', 'after', 'above', 'below', 'up', 'down',
  'in', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
  'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
]);

const { Option } = Select;
const { Search } = Input;

const ArticleManagement = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    source: '',
    tag: ''
  });
  
  // 导入相关状态
  const [articleContent, setArticleContent] = useState('');
  const [extractedWords, setExtractedWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [existingWords, setExistingWords] = useState(new Set());

  // 初始化Tiptap编辑器
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      })
    ],
    content: '<p>请输入文章内容...</p>',
    editorProps: {
      attributes: {
        class: 'min-h-[300px] p-2.5'
      }
    },
    onUpdate: () => {
      console.log('Editor updated:', editor?.getHTML());
    }
  });

  // 调试编辑器状态
  useEffect(() => {
    console.log('Editor initialized:', !!editor);
    console.log('Editor content:', editor?.getHTML());
  }, [editor]);

  // 加载文章列表
  useEffect(() => {
    loadArticles();
  }, [searchQuery, filters]);
  
  // 加载现有单词，用于过滤重复单词
  useEffect(() => {
    loadExistingWords();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      let allArticles = await db.getAllArticles();

      // 搜索过滤
      if (searchQuery) {
        allArticles = allArticles.filter(article => 
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // 来源过滤
      if (filters.source) {
        allArticles = allArticles.filter(article => article.source === filters.source);
      }

      // 标签过滤
      if (filters.tag) {
        allArticles = allArticles.filter(article => article.tags.includes(filters.tag));
      }

      setArticles(allArticles);
    } catch (error) {
      message.error('加载文章失败');
      console.error('加载文章失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 加载现有单词
  const loadExistingWords = async () => {
    try {
      const words = await db.getAllWords();
      const wordSet = new Set(words.map(word => word.word.toLowerCase()));
      setExistingWords(wordSet);
    } catch (error) {
      console.error('加载现有单词失败:', error);
    }
  };
  
  // 打开导入模态框
  const showImportModal = () => {
    setArticleContent('');
    setExtractedWords([]);
    setSelectedWords([]);
    setIsImportModalOpen(true);
  };
  
  // 关闭导入模态框
  const handleImportCancel = () => {
    setIsImportModalOpen(false);
  };
  
  // 从文本中提取单词
  const extractWordsFromText = (text) => {
    // 移除HTML标签
    const cleanText = text.replace(/<[^>]*>/g, '');
    // 提取单词（只包含字母和数字）
    const words = cleanText.match(/\b[a-zA-Z]+\b/g) || [];
    return words;
  };
  
  // 获取单词的上下文
  const getWordContext = (text, word) => {
    const cleanText = text.replace(/<[^>]*>/g, '');
    const sentences = cleanText.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(word.toLowerCase())) {
        return sentence.trim();
      }
    }
    return '';
  };
  
  // 提取单词
  const extractWords = async () => {
    if (!articleContent.trim()) {
      message.error('请输入文章内容');
      return;
    }

    setLoading(true);
    try {
      // 提取单词
      const words = extractWordsFromText(articleContent);
      // 过滤停用词和现有单词
      const filteredWords = words.filter(word => 
        !stopWords.has(word.toLowerCase()) && 
        !existingWords.has(word.toLowerCase())
      );
      // 去重
      const uniqueWords = [...new Set(filteredWords)];
      // 获取每个单词的上下文
      const wordsWithContext = uniqueWords.map(word => ({
        word,
        context: getWordContext(articleContent, word),
        selected: true
      }));

      setExtractedWords(wordsWithContext);
      setSelectedWords(wordsWithContext.map(item => item.word));
      message.success(`成功提取 ${wordsWithContext.length} 个新单词`);
    } catch (error) {
      message.error('提取单词失败');
      console.error('提取单词失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 处理单词选择
  const handleWordSelect = (word, checked) => {
    if (checked) {
      setSelectedWords([...selectedWords, word]);
      setExtractedWords(extractedWords.map(item => 
        item.word === word ? { ...item, selected: true } : item
      ));
    } else {
      setSelectedWords(selectedWords.filter(w => w !== word));
      setExtractedWords(extractedWords.map(item => 
        item.word === word ? { ...item, selected: false } : item
      ));
    }
  };
  
  // 全选/取消全选
  const handleSelectAll = (checked) => {
    if (checked) {
      const allWords = extractedWords.map(item => item.word);
      setSelectedWords(allWords);
      setExtractedWords(extractedWords.map(item => ({ ...item, selected: true })));
    } else {
      setSelectedWords([]);
      setExtractedWords(extractedWords.map(item => ({ ...item, selected: false })));
    }
  };
  
  // 保存提取的单词
  const saveExtractedWords = async () => {
    if (selectedWords.length === 0) {
      message.error('请选择要添加的单词');
      return;
    }

    setLoading(true);
    try {
      // 首先添加文章
      const article = {
        title: '导入文章',
        content: articleContent,
        source: '导入',
        wordCount: extractWordsFromText(articleContent).length,
        tags: ['导入'],
        isFavorite: false
      };

      const articleId = await db.addArticle(article);

      // 然后添加单词
      for (const wordItem of extractedWords) {
        if (selectedWords.includes(wordItem.word)) {
          // 添加单词
          const word = {
            word: wordItem.word,
            meaning: '',
            tags: ['导入'],
            isFavorite: false
          };

          await db.addWord(word);
        }
      }

      message.success(`成功添加 ${selectedWords.length} 个单词`);
      setIsImportModalOpen(false);
      // 重新加载现有单词和文章列表
      loadExistingWords();
      loadArticles();
    } catch (error) {
      message.error('保存单词失败');
      console.error('保存单词失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 打开添加文章模态框
  const showAddModal = () => {
    setEditingArticle(null);
    form.resetFields();
    editor.commands.setContent('<p></p>');
    setIsModalOpen(true);
  };

  // 打开编辑文章模态框
  const showEditModal = (article) => {
    setEditingArticle(article);
    form.setFieldsValue({
      title: article.title,
      source: article.source,
      tags: article.tags.join(','),
      isFavorite: article.isFavorite
    });
    editor.commands.setContent(article.content);
    setIsModalOpen(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // 计算单词数
  const countWords = (text) => {
    // 简单的单词计数，实际应用中可能需要更复杂的算法
    const cleanText = text.replace(/<[^>]*>/g, ''); // 移除HTML标签
    const words = cleanText.match(/\b\w+\b/g) || [];
    return words.length;
  };

  // 提交表单
  const handleSubmit = async (values) => {
    try {
      const content = editor.getHTML();
      
      // 检查编辑器内容是否为空
      if (!content || content === '<p></p>') {
        message.error('请输入文章内容');
        return;
      }
      
      const wordCount = countWords(content);

      const articleData = {
        ...values,
        content,
        wordCount,
        tags: values.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (editingArticle) {
        // 编辑文章
        await db.updateArticle(editingArticle.id, articleData);
        message.success('文章更新成功');
      } else {
        // 添加文章
        await db.addArticle(articleData);
        message.success('文章添加成功');
      }

      setIsModalOpen(false);
      loadArticles();
    } catch (error) {
      message.error('操作失败');
      console.error('操作失败:', error);
    }
  };

  // 删除文章
  const handleDelete = async (article) => {
    try {
      await db.deleteArticle(article.id);
      message.success('文章删除成功');
      loadArticles();
    } catch (error) {
      message.error('删除失败');
      console.error('删除失败:', error);
    }
  };

  // 查看文章详情
  const showArticleDetail = (article) => {
    setSelectedArticleId(article.id);
    setIsDetailModalOpen(true);
  };

  // 表格列定义
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title)
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source'
    },
    {
      title: '单词数',
      dataIndex: 'wordCount',
      key: 'wordCount',
      sorter: (a, b) => a.wordCount - b.wordCount
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      sorter: (a, b) => a.difficulty - b.difficulty
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
    // {
    //   title: '收藏',
    //   dataIndex: 'isFavorite',
    //   key: 'isFavorite',
    //   render: (isFavorite) => (
    //     <StarOutlined 
    //       style={{ 
    //         color: isFavorite ? '#fadb14' : 'var(--text-secondary)',
    //         fontSize: '16px'
    //       }} 
    //     />
    //   )
    // },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => showArticleDetail(record)}
          />
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
        <h2 className="m-0 text-text-h">文章管理</h2>
        <div className="flex gap-2.5">
          <Button 
            type="primary" 
            icon={<ImportOutlined />} 
            onClick={showImportModal}
            className="mb-5"
          >
            导入文章并提取单词
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showAddModal}
            className="mb-5"
          >
            添加文章
          </Button>
        </div>
      </div> */}

      <div className="flex items-center mb-5 flex-wrap gap-2.5">
        <Search
          placeholder="搜索文章标题或内容"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 300, marginRight: 16 }}
          prefix={<SearchOutlined />}
        />
        <Select
          placeholder="按来源筛选"
          value={filters.source}
          onChange={(value) => setFilters({ ...filters, source: value })}
          style={{ width: 150, marginRight: 16 }}
          allowClear
        >
          {/* 动态生成来源选项 */}
          {Array.from(new Set(articles.map(article => article.source))).map(source => (
            <Option key={source} value={source}>{source}</Option>
          ))}
        </Select>
        <Select
          placeholder="按标签筛选"
          value={filters.tag}
          onChange={(value) => setFilters({ ...filters, tag: value })}
          style={{ width: 150 }}
          allowClear
        >
          {/* 动态生成标签选项 */}
          {Array.from(new Set(articles.flatMap(article => article.tags))).map(tag => (
            <Option key={tag} value={tag}>{tag}</Option>
          ))}
        </Select>
        <Button 
            type="primary" 
            icon={<ImportOutlined />} 
            onClick={showImportModal}
            // className="mb-5"
          >
            导入
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showAddModal}
            // className="mb-5"
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
        dataSource={articles}
        loading={loading}
        pagination={{ pageSize: 12 }}
        renderItem={(article) => (
          <List.Item>
            <Card 
              hoverable 
              className="cursor-pointer" 
              onClick={() => showArticleDetail(article)}
              actions={[
                <Button 
                  key="edit" 
                  icon={<EditOutlined />} 
                  onClick={(e) => {
                    e.stopPropagation();
                    showEditModal(article);
                  }}
                />,
                <Button 
                  key="delete" 
                  icon={<DeleteOutlined />} 
                  danger 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(article);
                  }}
                />
              ]}
            >
              <Card.Meta
                title={article.title}
                description={
                  <div className="flex flex-col gap-2">
                    <div>来源: {article.source}</div>
                    <div>单词数: {article.wordCount}</div>
                    <div>
                      标签: {article.tags.map(tag => (
                        <Tag key={tag} className="mr-1">{tag}</Tag>
                      ))}
                    </div>
                    {/* <div>收藏: {article.isFavorite ? '是' : '否'}</div> */}
                  </div>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title={editingArticle ? '编辑文章' : '添加文章'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入文章标题' }]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>

          <Form.Item
            name="source"
            label="来源"
            rules={[{ required: true, message: '请输入文章来源' }]}
          >
            <Input placeholder="如：四六级、新闻" />
          </Form.Item>

          <Form.Item
            label="内容"
          >
            <div style={{ border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              {/* 工具栏 */}
              {editor && (
                <div className="flex gap-2 p-2 border-b border-border bg-bg">
                  {/* 标题选择 */}
                  {/* <div className="flex gap-1">
                    <Button 
                      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--border)', fontSize: '16px', fontWeight: 'bold' }}
                    >
                      H1
                    </Button>
                    <Button 
                      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--border)', fontSize: '14px', fontWeight: 'bold' }}
                    >
                      H2
                    </Button>
                    <Button 
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--border)', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      H3
                    </Button>
                    <Button 
                      onClick={() => editor.chain().focus().setParagraph().run()}
                      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--border)' }}
                    >
                      P
                    </Button>
                  </div> */}
                  <Button 
                    icon={<BoldOutlined />} 
                    onClick={() => editor.commands.toggleBold()}
                    style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--border)' }}
                  />
                  <Button 
                    icon={<ItalicOutlined />} 
                    onClick={() => editor.commands.toggleItalic()}
                    style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--border)' }}
                  />
                  <Button 
                    icon={<UnderlineOutlined />} 
                    onClick={() => editor.commands.toggleUnderline()}
                    style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--border)' }}
                  />
                  
                </div>
              )}
              {/* 编辑器内容 */}
              <div style={{ minHeight: '300px', padding: '10px', backgroundColor: 'var(--bg)' }}>
                {editor && <EditorContent editor={editor} />}
                {!editor && <div className="flex justify-center items-center h-full text-text-secondary">加载编辑器中...</div>}
              </div>
            </div>
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签"
            rules={[{ required: true, message: '请输入标签' }]}
          >
            <Input placeholder="请输入标签，用逗号分隔" />
          </Form.Item>

          {/* <Form.Item
            name="isFavorite"
            label="收藏"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item> */}

          <Form.Item className="flex justify-end gap-2.5 mt-5">
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" htmlType="submit">
              {editingArticle ? '更新' : '添加'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <ArticleDetail
        articleId={selectedArticleId}
        visible={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
      
      {/* 导入文章模态框 */}
      <Modal
        title="导入文章并提取单词"
        open={isImportModalOpen}
        onCancel={handleImportCancel}
        footer={null}
        width={800}
      >
        <Form layout="vertical">
          <Form.Item
            label="文章内容"
            rules={[{ required: true, message: '请输入文章内容' }]}
          >
            <TextArea 
              rows={10} 
              placeholder="请粘贴英文文章内容"
              value={articleContent}
              onChange={(e) => setArticleContent(e.target.value)}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              onClick={extractWords}
              loading={loading}
            >
              提取单词
            </Button>
          </Form.Item>

          {extractedWords.length > 0 && (
            <div className="mt-5">
              <Divider orientation="left">提取结果</Divider>
              <div className="mb-4">
                <Checkbox 
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  checked={selectedWords.length === extractedWords.length && extractedWords.length > 0}
                >
                  全选 ({selectedWords.length}/{extractedWords.length})
                </Checkbox>
              </div>
              <List
                itemLayout="vertical"
                dataSource={extractedWords}
                renderItem={(item) => (
                  <List.Item>
                    <Card
                      size="small"
                      className={item.selected ? 'border border-accent bg-accent-bg' : ''}
                    >
                      <div className="flex flex-col items-start gap-2">
                        <Checkbox 
                          checked={item.selected}
                          onChange={(e) => handleWordSelect(item.word, e.target.checked)}
                          className="self-start mt-0.5"
                        />
                        <Text strong>{item.word}</Text>
                        <Text type="secondary" className="mt-1 text-sm leading-relaxed max-w-full break-words">
                          {item.context}
                        </Text>
                      </div>
                    </Card>
                  </List.Item>
                )}
                pagination={{ pageSize: 10 }}
              />
              <div className="flex justify-end gap-2.5 mt-5">
                <Button onClick={handleImportCancel}>取消</Button>
                <Button 
                  type="primary" 
                  onClick={saveExtractedWords}
                  loading={loading}
                  disabled={selectedWords.length === 0}
                >
                  保存选中的单词
                </Button>
              </div>
            </div>
          )}

          {extractedWords.length === 0 && articleContent.trim() && (
            <Alert 
              message="未提取到新单词" 
              description="文章中可能没有新单词，或所有单词都是停用词。" 
              type="info" 
              showIcon 
            />
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default ArticleManagement;