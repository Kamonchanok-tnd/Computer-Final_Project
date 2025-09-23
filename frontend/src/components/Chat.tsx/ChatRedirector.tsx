import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecentChat } from '../../services/https/Chat';
import { Spin } from 'antd';

function ChatRedirector() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkRecentChat = async () => {
      const Uid = localStorage.getItem('id');
      if (!Uid) return navigate('/login');

      const message = await RecentChat(Number(Uid));

      if (!message.has_active || message.chat_room_id === 0) {
        // ห้องไม่มี → เริ่มแชทใหม่
        navigate('/chat/new');
      } else {
        // ห้องมี → ไปห้องนั้น
        navigate(`/chat/${message.chat_room_id}`);
      }
    };

    checkRecentChat();
  }, []);

  return  <div className="fixed inset-0 flex items-center justify-center  z-50">
  <Spin size="large" tip="กำลังโหลด..." />
</div>
}

export default ChatRedirector;
