import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
} from '@mui/material';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({});
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const [usersRes, chatsRes, messagesRes] = await Promise.all([
        axios.get('/api/users/'),
        axios.get('/api/chats/'),
        axios.get('/api/messages/'),
      ]);

      setUsers(usersRes.data);
      setChats(chatsRes.data);
      setMessages(messagesRes.data);

      // Generate statistics
      setStats({
        totalUsers: usersRes.data.length,
        totalChats: chatsRes.data.length,
        totalMessages: messagesRes.data.length,
        activeUsers: usersRes.data.filter(u => u.is_online).length,
        todayMessages: messagesRes.data.filter(m =>
          new Date(m.created_at).toDateString() === new Date().toDateString()
        ).length,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const deactivateUser = async (userId) => {
    try {
      await axios.patch(`/api/users/${userId}/`, { is_active: false });
      fetchData();
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  };

  if (!isAdmin) {
    return (
      <Container>
        <Typography variant="h4" color="error" align="center" sx={{ mt: 4 }}>
          Access Denied. Admin privileges required.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h5">{stats.totalUsers || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Chats
              </Typography>
              <Typography variant="h5">{stats.totalChats || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Messages
              </Typography>
              <Typography variant="h5">{stats.totalMessages || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Online Users
              </Typography>
              <Typography variant="h5">{stats.activeUsers || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Statistics Grid */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Statistics Overview
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2">Today's Messages</Typography>
              <Typography variant="h6">{stats.todayMessages || 0}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2">Private Chats</Typography>
              <Typography variant="h6">
                {chats.filter(c => c.chat_type === 'private').length}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2">Group Chats</Typography>
              <Typography variant="h6">
                {chats.filter(c => c.chat_type === 'group').length}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2">Active Users</Typography>
              <Typography variant="h6">{stats.activeUsers || 0}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((userItem) => (
              <TableRow key={userItem.id}>
                <TableCell>{userItem.id}</TableCell>
                <TableCell>{userItem.username}</TableCell>
                <TableCell>{userItem.email}</TableCell>
                <TableCell>{userItem.role}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: userItem.is_online ? 'success.main' : 'error.main',
                      mr: 1,
                    }}
                  />
                  {userItem.is_online ? 'Online' : 'Offline'}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    color="warning"
                    onClick={() => deactivateUser(userItem.id)}
                    disabled={userItem.id === user?.id}
                  >
                    Deactivate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Recent Messages */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Messages
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Sender</TableCell>
              <TableCell>Chat</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.slice(0, 5).map((msg) => (
              <TableRow key={msg.id}>
                <TableCell>{msg.id}</TableCell>
                <TableCell>{msg.sender?.username || 'Unknown'}</TableCell>
                <TableCell>{msg.chat}</TableCell>
                <TableCell>{msg.content?.slice(0, 50) || 'No content'}...</TableCell>
                <TableCell>{new Date(msg.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default AdminPanel;