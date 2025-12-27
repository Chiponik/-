import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Link } from 'react-router-dom';

const ChatList = () => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      const response = await api.get('/chats/');
      setChats(response.data);
    };
    fetchChats();
  }, []);

  return (
    <div>
      <h2>Chats</h2>
      <ul>
        {chats.map(chat => (
          <li key={chat.id}>
            <Link to={`/chats/${chat.id}`}>{chat.name || `Chat ${chat.id}`}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;