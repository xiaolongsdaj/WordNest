import React, { useState, useEffect } from 'react';
import { Button, Modal, Upload, message, Alert } from 'antd';
import { DownloadOutlined, UploadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { exportData, importData, isDatabaseEmpty } from '../utils/backupRestore';

const { confirm } = Modal;

const BackupRestore = () => {
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [databaseEmpty, setDatabaseEmpty] = useState(false);

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    // 检查localStorage中是否已经显示过弹窗
    const hasShownPrompt = localStorage.getItem('backupRestorePromptShown');
    if (hasShownPrompt) return;
    
    const empty = await isDatabaseEmpty();
    setDatabaseEmpty(empty);
    if (empty) {
      // 标记弹窗已显示
      localStorage.setItem('backupRestorePromptShown', 'true');
      showRestorePrompt();
    }
  };

  const showRestorePrompt = () => {
    confirm({
      title: '检测到无本地数据',
      icon: <ExclamationCircleOutlined />,
      content: '是否上传备份文件恢复数据？',
      onOk: () => {
        setIsRestoreModalOpen(true);
      },
      onCancel: () => {
        // 不做任何操作，继续使用空数据库
      },
    });
  };

  const handleBackup = async () => {
    const success = await exportData();
    if (success) {
      message.success('备份成功');
    } else {
      message.error('备份失败');
    }
  };

  const handleRestore = async (file) => {
    try {
      await importData(file);
      message.success('恢复成功');
      setIsRestoreModalOpen(false);
      // 刷新页面以显示恢复的数据
      window.location.reload();
    } catch (error) {
      message.error(`恢复失败: ${error.message}`);
    }
  };

  const beforeUpload = (file) => {
    const isJSON = file.type === 'application/json';
    if (!isJSON) {
      message.error('请上传JSON格式的备份文件');
    }
    return isJSON;
  };

  return (
    <div>
      <Button 
        icon={<DownloadOutlined />} 
        onClick={handleBackup}
        className="mr-2.5"
      >
      </Button>

      <Modal
        title="恢复数据"
        open={isRestoreModalOpen}
        onCancel={() => setIsRestoreModalOpen(false)}
        footer={null}
      >
        <Alert 
          message="请选择备份文件进行恢复"
          description="恢复操作会覆盖当前所有数据，请确保选择正确的备份文件。"
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
        />
        <Upload
          name="file"
          accept=".json"
          beforeUpload={beforeUpload}
          showUploadList={false}
          customRequest={({ file }) => {
            handleRestore(file);
          }}
        >
          <Button icon={<UploadOutlined />}>选择备份文件</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default BackupRestore;