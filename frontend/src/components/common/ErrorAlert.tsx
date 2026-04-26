import { Alert, Button, Typography } from 'antd';
import { useState } from 'react';
import { ErrorType, parseError } from '../../utils/errorHandler';

const { Text } = Typography;

interface ErrorAlertProps {
  error: any;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
}

/**
 * Reusable error alert component with consistent styling and behavior
 */
const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, title, onRetry, onDismiss, showDetails = false }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!error) return null;

  const appError = parseError(error);

  const getSeverity = (): 'warning' | 'error' => {
    return appError.type === ErrorType.VALIDATION ? 'warning' : 'error';
  };

  const getDefaultTitle = () => {
    switch (appError.type) {
      case ErrorType.NETWORK: return 'Erro de Conexão';
      case ErrorType.VALIDATION: return 'Dados Inválidos';
      case ErrorType.AUTHENTICATION: return 'Autenticação Necessária';
      case ErrorType.AUTHORIZATION: return 'Acesso Negado';
      case ErrorType.NOT_FOUND: return 'Não Encontrado';
      case ErrorType.SERVER: return 'Erro no Servidor';
      default: return 'Erro';
    }
  };

  return (
    <Alert
      type={getSeverity()}
      message={title || getDefaultTitle()}
      description={
        <>
          {appError.message}
          {showDetails && process.env.NODE_ENV === 'development' && appError.originalError && (
            <div style={{ marginTop: 8 }}>
              <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setDetailsOpen(!detailsOpen)}>
                {detailsOpen ? 'Ocultar' : 'Mostrar'} detalhes técnicos
              </Button>
              {detailsOpen && (
                <div style={{ marginTop: 8, padding: 8, background: 'rgba(0,0,0,0.1)', borderRadius: 4, fontFamily: 'monospace', fontSize: 12, overflow: 'auto', maxHeight: 200 }}>
                  <div><Text strong>Tipo:</Text> {appError.type}</div>
                  {appError.statusCode && <div><Text strong>Status:</Text> {appError.statusCode}</div>}
                  {appError.details && <div><Text strong>Detalhes:</Text> {JSON.stringify(appError.details, null, 2)}</div>}
                  <div><Text strong>Erro Original:</Text> {appError.originalError?.message || 'N/A'}</div>
                </div>
              )}
            </div>
          )}
        </>
      }
      closable={!!onDismiss}
      onClose={onDismiss}
      action={onRetry && <Button size="small" onClick={onRetry}>Tentar Novamente</Button>}
      showIcon
      style={{ marginBottom: 16 }}
    />
  );
};

export default ErrorAlert;
