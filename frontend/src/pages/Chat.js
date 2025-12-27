import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  Container,
  Grid,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  IconButton,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  SelectChangeEvent,
  Divider,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MessageIcon from '@mui/icons-material/Message';
import GroupsIcon from '@mui/icons-material/Groups';
import CampaignIcon from '@mui/icons-material/Campaign';
import CloseIcon from '@mui/icons-material/Close';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Chat = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [chats, setChats] = useState([]);
  const [groups, setGroups] = useState([]);
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatType, setSelectedChatType] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [adminTab, setAdminTab] = useState(0);
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    maxFileSize: 10,
    messageHistoryDays: 30,
    enableNotifications: true,
    enableReadReceipts: true,
  });
  const [allUsers, setAllUsers] = useState([]);
  const [allChats, setAllChats] = useState([]);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editUserData, setEditUserData] = useState({
    username: '',
    email: '',
    role: 'user',
    isActive: true,
  });
  const { user, logout } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
    fetchGroups();
    fetchChannels();
    fetchAvailableUsers();
    if (user?.role === 'admin') {
      fetchAllUsers();
      fetchAllChatsData();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chats/');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/groups/');
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await axios.get('/api/channels/');
      setChannels(response.data);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await axios.get('/api/users/');
      const filteredUsers = response.data.filter(u => u.id !== user?.id);
      setAvailableUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users/');
      setAllUsers(response.data);
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  };

  const fetchAllChatsData = async () => {
    try {
      const response = await axios.get('/api/admin/chats/');
      setAllChats(response.data);
    } catch (error) {
      console.error('Error fetching all chats:', error);
    }
  };

  const fetchMessages = async (chatId, type) => {
    try {
      let response;
      switch (type) {
        case 'chat':
          response = await axios.get(`/api/chats/${chatId}/messages/`);
          break;
        case 'group':
          response = await axios.get(`/api/groups/${chatId}/messages/`);
          break;
        case 'channel':
          response = await axios.get(`/api/channels/${chatId}/messages/`);
          break;
        default:
          return;
      }
      setMessages(response.data);
      setSelectedChat(chatId);
      setSelectedChatType(type);
      setDrawerOpen(true);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !selectedChatType) return;

    try {
      let endpoint;
      switch (selectedChatType) {
        case 'chat':
          endpoint = '/api/messages/';
          break;
        case 'group':
          endpoint = '/api/group-messages/';
          break;
        case 'channel':
          endpoint = '/api/channel-messages/';
          break;
        default:
          return;
      }

      await axios.post(endpoint, {
        [selectedChatType === 'chat' ? 'chat' : 
        selectedChatType === 'group' ? 'group' : 'channel']: selectedChat,
        content: newMessage,
      });
      setNewMessage('');
      fetchMessages(selectedChat, selectedChatType);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedUsers.length === 0) return;

    try {
      await axios.post('/api/groups/', {
        name: newGroupName,
        members: [...selectedUsers.map(u => u.id), user?.id],
      });
      setCreateGroupOpen(false);
      setNewGroupName('');
      setSelectedUsers([]);
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleSystemSettingsChange = (setting: String, value: Any) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveSystemSettings = async () => {
    try {
      await axios.put('/api/admin/settings/', systemSettings);
      alert('Настройки сохранены');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setEditUserData({
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
    });
    setEditUserOpen(true);
  };

  const saveUserChanges = async () => {
    try {
      await axios.put(`/api/admin/users/${userToEdit.id}/`, editUserData);
      fetchAllUsers();
      setEditUserOpen(false);
      alert('Пользователь обновлен');
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await axios.delete(`/api/admin/users/${userId}/`);
        fetchAllUsers();
        alert('Пользователь удален');
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`/api/admin/users/${userId}/toggle-status/`, {
        is_active: !currentStatus
      });
      fetchAllUsers();
      alert('Статус пользователя изменен');
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const deleteChat = async (chatId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот чат?')) {
      try {
        await axios.delete(`/api/admin/chats/${chatId}/`);
        fetchAllChatsData();
        alert('Чат удален');
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case 0:
        return chats;
      case 1:
        return groups;
      case 2:
        return channels;
      default:
        return [];
    }
  };

  const getItemName = (item) => {
    if (activeTab === 0) {
      const otherUser = item.participants?.find(p => p.id !== user?.id);
      return otherUser?.username || `Chat ${item.id}`;
    }
    return item.name || `Chat ${item.id}`;
  };

  const getItemAvatar = (item) => {
    if (activeTab === 0) {
      const otherUser = item.participants?.find(p => p.id !== user?.id);
      return otherUser?.username?.[0] || 'U';
    }
    return item.name?.[0] || 'C';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Шапка с навигацией */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Messenger
          </Typography>
          
          <Button 
            color="inherit" 
            startIcon={<MessageIcon />}
            onClick={() => setActiveTab(0)}
            sx={{ mr: 1 }}
          >
            Чаты
          </Button>
          
          <Button 
            color="inherit" 
            startIcon={<GroupAddIcon />}
            onClick={() => setCreateGroupOpen(true)}
            sx={{ mr: 1 }}
          >
            Создать группу
          </Button>
          
          <Button 
            color="inherit" 
            startIcon={<PersonIcon />}
            sx={{ mr: 1 }}
          >
            Мой профиль
          </Button>
          
          <Button 
            color="inherit" 
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsOpen(true)}
            sx={{ mr: 1 }}
          >
            Настройки
          </Button>
          
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Основной контент */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 3 }}>
        <Grid container spacing={3}>
          {/* Боковая панель с выбором типа и списком */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  variant="fullWidth"
                >
                  <Tab icon={<MessageIcon />} label="Чаты" />
                  <Tab icon={<GroupsIcon />} label="Группы" />
                  <Tab icon={<CampaignIcon />} label="Каналы" />
                </Tabs>
              </Box>

              <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                {getCurrentItems().map((item) => (
                  <ListItem
                    key={item.id}
                    button
                    selected={selectedChat === item.id && selectedChatType === ['chat', 'group', 'channel'][activeTab]}
                    onClick={() => fetchMessages(item.id, ['chat', 'group', 'channel'][activeTab])}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={item.unread_count}
                        color="primary"
                        invisible={!item.unread_count || item.unread_count === 0}
                      >
                        <Avatar>
                          {getItemAvatar(item)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={getItemName(item)}
                      secondary={
                        <Typography noWrap>
                          {item.last_message?.content || 'Нет сообщений'}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Основная область */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ 
              height: 'calc(100vh - 180px)', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.50'
            }}>
              <MessageIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Выберите чат для начала общения
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Выберите чат, группу или канал из списка слева
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Drawer с чатом */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: '60%', minWidth: 400 }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ mr: 2 }}>
                {selectedChat && getCurrentItems().find(item => item.id === selectedChat)?.name?.[0] || 'C'}
              </Avatar>
              <Typography variant="h6">
                {selectedChat && getItemName(getCurrentItems().find(item => item.id === selectedChat))}
              </Typography>
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender.id === user?.id ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Paper
                  sx={{
                    p: 1.5,
                    maxWidth: '70%',
                    bgcolor: message.sender.id === user?.id ? 'primary.light' : 'grey.100',
                  }}
                >
                  <Typography variant="caption" display="block" gutterBottom>
                    {message.sender.username}
                  </Typography>
                  <Typography variant="body1">{message.content}</Typography>
                  <Typography variant="caption" display="block" textAlign="right">
                    {new Date(message.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Typography>
                </Paper>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={1}>
              <Grid item xs={10}>
                <TextField
                  fullWidth
                  size="medium"
                  placeholder="Введите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  fullWidth
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  sx={{ height: '100%' }}
                >
                  Отправить
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Drawer>

      {/* Диалог создания группы */}
      <Dialog open={createGroupOpen} onClose={() => setCreateGroupOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать новую группу</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название группы"
            fullWidth
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <FormControl fullWidth>
            <InputLabel>Добавить участников</InputLabel>
            <Select
              multiple
              value={selectedUsers}
              onChange={(e) => setSelectedUsers(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((user) => (
                    <Chip key={user.id} label={user.username} />
                  ))}
                </Box>
              )}
            >
              {availableUsers.map((user) => (
                <MenuItem key={user.id} value={user}>
                  <ListItemAvatar>
                    <Avatar>{user.username[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={user.username} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateGroupOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleCreateGroup} 
            variant="contained"
            disabled={!newGroupName.trim() || selectedUsers.length === 0}
          >
            Создать группу
          </Button>
        </DialogActions>
      </Dialog>

      {/* Административная панель в настройках */}
      <Dialog 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        maxWidth="lg" 
        fullWidth
        maxHeight="90vh"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <AdminPanelSettingsIcon sx={{ mr: 1 }} />
          Административная панель
          {user?.role === 'admin' && (
            <Chip 
              label="Администратор" 
              color="primary" 
              size="small" 
              sx={{ ml: 2 }} 
            />
          )}
        </DialogTitle>
        
        <DialogContent dividers sx={{ minHeight: '60vh' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={adminTab} onChange={(e, newValue) => setAdminTab(newValue)}>
              <Tab icon={<PeopleIcon />} label="Пользователи" />
              <Tab icon={<MessageIcon />} label="Чаты" />
              <Tab icon={<SecurityIcon />} label="Системные настройки" />
              <Tab icon={<SystemUpdateAltIcon />} label="Статистика" />
            </Tabs>
          </Box>

          {/* Вкладка Пользователи */}
          {adminTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Управление пользователями ({allUsers.length})
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Имя пользователя</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Роль</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>Дата регистрации</TableCell>
                      <TableCell>Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allUsers.map((userItem) => (
                      <TableRow key={userItem.id}>
                        <TableCell>{userItem.id}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                              {userItem.username[0]}
                            </Avatar>
                            {userItem.username}
                          </Box>
                        </TableCell>
                        <TableCell>{userItem.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={userItem.role} 
                            size="small"
                            color={userItem.role === 'admin' ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={userItem.is_active ? <CheckCircleIcon /> : <BlockIcon />}
                            label={userItem.is_active ? 'Активен' : 'Заблокирован'}
                            color={userItem.is_active ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(userItem.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleEditUser(userItem)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => toggleUserStatus(userItem.id, userItem.is_active)}
                            color={userItem.is_active ? 'warning' : 'success'}
                          >
                            {userItem.is_active ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => deleteUser(userItem.id)}
                            color="error"
                            disabled={userItem.id === user?.id}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Вкладка Чаты */}
          {adminTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Управление чатами ({allChats.length})
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Тип</TableCell>
                      <TableCell>Название</TableCell>
                      <TableCell>Участников</TableCell>
                      <TableCell>Сообщений</TableCell>
                      <TableCell>Создан</TableCell>
                      <TableCell>Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allChats.map((chat) => (
                      <TableRow key={chat.id}>
                        <TableCell>{chat.id}</TableCell>
                        <TableCell>
                          <Chip 
                            label={chat.type} 
                            size="small"
                            color={
                              chat.type === 'private' ? 'default' :
                              chat.type === 'group' ? 'primary' : 'secondary'
                            }
                          />
                        </TableCell>
                        <TableCell>{chat.name || `Чат ${chat.id}`}</TableCell>
                        <TableCell>{chat.participants_count}</TableCell>
                        <TableCell>{chat.messages_count}</TableCell>
                        <TableCell>
                          {new Date(chat.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => deleteChat(chat.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Вкладка Системные настройки */}
          {adminTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Системные настройки
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Основные настройки
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemSettings.maintenanceMode}
                          onChange={(e) => handleSystemSettingsChange('maintenanceMode', e.target.checked)}
                        />
                      }
                      label="Режим обслуживания"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemSettings.allowRegistrations}
                          onChange={(e) => handleSystemSettingsChange('allowRegistrations', e.target.checked)}
                        />
                      }
                      label="Разрешить регистрацию"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemSettings.enableNotifications}
                          onChange={(e) => handleSystemSettingsChange('enableNotifications', e.target.checked)}
                        />
                      }
                      label="Включить уведомления"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemSettings.enableReadReceipts}
                          onChange={(e) => handleSystemSettingsChange('enableReadReceipts', e.target.checked)}
                        />
                      }
                      label="Включить подтверждение прочтения"
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Ограничения
                    </Typography>
                    <TextField
                      fullWidth
                      label="Максимальный размер файла (МБ)"
                      type="number"
                      value={systemSettings.maxFileSize}
                      onChange={(e) => handleSystemSettingsChange('maxFileSize', parseInt(e.target.value))}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Хранение истории сообщений (дней)"
                      type="number"
                      value={systemSettings.messageHistoryDays}
                      onChange={(e) => handleSystemSettingsChange('messageHistoryDays', parseInt(e.target.value))}
                    />
                  </Paper>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={saveSystemSettings}>
                  Сохранить настройки
                </Button>
              </Box>
            </Box>
          )}

          {/* Вкладка Статистика */}
          {adminTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Статистика системы
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {allUsers.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Пользователей
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="secondary">
                      {allChats.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Чатов
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {groups.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Групп
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {channels.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Каналов
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  Система работает стабильно. Последнее обновление: {new Date().toLocaleDateString()}
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования пользователя */}
      <Dialog open={editUserOpen} onClose={() => setEditUserOpen(false)}>
        <DialogTitle>Редактировать пользователя</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Имя пользователя"
            fullWidth
            value={editUserData.username}
            onChange={(e) => setEditUserData({...editUserData, username: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={editUserData.email}
            onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Роль</InputLabel>
            <Select
              value={editUserData.role}
              label="Роль"
              onChange={(e) => setEditUserData({...editUserData, role: e.target.value})}
            >
              <MenuItem value="user">Пользователь</MenuItem>
              <MenuItem value="moderator">Модератор</MenuItem>
              <MenuItem value="admin">Администратор</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={editUserData.isActive}
                onChange={(e) => setEditUserData({...editUserData, isActive: e.target.checked})}
              />
            }
            label="Активен"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserOpen(false)}>Отмена</Button>
          <Button onClick={saveUserChanges} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chat;