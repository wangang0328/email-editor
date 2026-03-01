import React from 'react';
import { Drawer, List, Button, Popconfirm } from '@arco-design/web-react';
import { IconDelete } from '@arco-design/web-react/icon';
import { Conversation } from '@demo/services/ai';

interface ConversationHistoryProps {
  visible: boolean;
  conversations: Conversation[];
  onClose: () => void;
  onLoadConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  visible,
  conversations,
  onClose,
  onLoadConversation,
  onDeleteConversation
}) => {
  return (
    <Drawer
      title="历史会话"
      visible={visible}
      onCancel={onClose}
      width={300}
      placement="right"
      footer={null}
    >
      <List
        dataSource={conversations}
        render={(item) => (
          <List.Item
            key={item.id}
            style={{ cursor: 'pointer' }}
            onClick={() => onLoadConversation(item.id)}
            actions={[
              <Popconfirm
                key="delete"
                title="确定删除此会话？"
                onOk={(e) => {
                  e?.stopPropagation();
                  onDeleteConversation(item.id);
                }}
              >
                <Button
                  type="text"
                  size="mini"
                  icon={<IconDelete />}
                  status="danger"
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={item.title || '新会话'}
              description={new Date(item.updatedAt).toLocaleString()}
            />
          </List.Item>
        )}
        noDataElement={
          <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
            暂无历史会话
          </div>
        }
      />
    </Drawer>
  );
};
