import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Input, Typography, theme } from 'antd';
import { LoginOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { login, isMockMode, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/admin');
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login(username, password);
      if (success) navigate('/admin');
      else setError('Usuário ou senha inválidos');
    } catch (err: any) {
      if (err.message === 'NEW_PASSWORD_REQUIRED') {
        setNeedsPasswordChange(true);
        setError('');
      } else {
        setError('Ocorreu um erro. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) { setError('As senhas não coincidem'); return; }
    if (newPassword.length < 8) { setError('A senha deve ter no mínimo 8 caracteres'); return; }
    setLoading(true);
    try {
      const success = await login(username, password, newPassword);
      if (success) navigate('/admin');
      else setError('Falha ao alterar senha');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao alterar a senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '64px auto 0', padding: '0 16px' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <LoginOutlined style={{ fontSize: 48, color: token.colorPrimary, marginBottom: 16 }} />
          <Title level={4} style={{ margin: 0 }}>Login Admin</Title>
          {isMockMode && (
            <Text type="warning" style={{ fontSize: 12 }}>🔧 Modo de Desenvolvimento (Mock Auth)</Text>
          )}
        </div>

        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

        {!needsPasswordChange ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label>Usuário</label>
              <Input size="large" autoFocus autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Senha</label>
              <Input.Password size="large" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required
                iconRender={(visible) => visible ? <EyeOutlined /> : <EyeInvisibleOutlined />} />
            </div>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            {isMockMode && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Text type="secondary">Credenciais demo: admin / admin</Text>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handlePasswordChange}>
            <Alert type="info" message="Você precisa alterar sua senha temporária" showIcon style={{ marginBottom: 16 }} />
            <div style={{ marginBottom: 16 }}>
              <label>Nova Senha</label>
              <Input.Password size="large" autoFocus value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                iconRender={(visible) => visible ? <EyeOutlined /> : <EyeInvisibleOutlined />} />
              <Text type="secondary" style={{ fontSize: 12 }}>Mínimo 8 caracteres, com maiúsculas, minúsculas e números</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Confirmar Nova Senha</label>
              <Input.Password size="large" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                iconRender={(visible) => visible ? <EyeOutlined /> : <EyeInvisibleOutlined />} />
            </div>
            <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ marginBottom: 8 }}>
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
            <Button block onClick={() => { setNeedsPasswordChange(false); setNewPassword(''); setConfirmPassword(''); setError(''); }} disabled={loading}>
              Voltar
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default LoginPage;
