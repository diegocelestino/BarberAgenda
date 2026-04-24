import { Alert, AlertTitle, Button, Collapse, Box } from '@mui/material';
import { useState } from 'react';
import { ErrorType, parseError } from '../../utils/errorHandler';

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
const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  title,
  onRetry,
  onDismiss,
  showDetails = false,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!error) return null;

  const appError = parseError(error);
  
  // Determine severity based on error type
  const getSeverity = () => {
    switch (appError.type) {
      case ErrorType.VALIDATION:
        return 'warning';
      case ErrorType.NETWORK:
      case ErrorType.SERVER:
        return 'error';
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return 'error';
      default:
        return 'error';
    }
  };

  // Get default title based on error type
  const getDefaultTitle = () => {
    switch (appError.type) {
      case ErrorType.NETWORK:
        return 'Erro de Conexão';
      case ErrorType.VALIDATION:
        return 'Dados Inválidos';
      case ErrorType.AUTHENTICATION:
        return 'Autenticação Necessária';
      case ErrorType.AUTHORIZATION:
        return 'Acesso Negado';
      case ErrorType.NOT_FOUND:
        return 'Não Encontrado';
      case ErrorType.SERVER:
        return 'Erro no Servidor';
      default:
        return 'Erro';
    }
  };

  return (
    <Alert
      severity={getSeverity()}
      onClose={onDismiss}
      sx={{ mb: 2 }}
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            Tentar Novamente
          </Button>
        )
      }
    >
      {(title || getDefaultTitle()) && (
        <AlertTitle>{title || getDefaultTitle()}</AlertTitle>
      )}
      {appError.message}
      
      {showDetails && process.env.NODE_ENV === 'development' && appError.originalError && (
        <Box sx={{ mt: 1 }}>
          <Button
            size="small"
            onClick={() => setDetailsOpen(!detailsOpen)}
            sx={{ textTransform: 'none', p: 0, minWidth: 0 }}
          >
            {detailsOpen ? 'Ocultar' : 'Mostrar'} detalhes técnicos
          </Button>
          <Collapse in={detailsOpen}>
            <Box
              sx={{
                mt: 1,
                p: 1,
                bgcolor: 'rgba(0,0,0,0.1)',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                overflow: 'auto',
                maxHeight: 200,
              }}
            >
              <div>
                <strong>Tipo:</strong> {appError.type}
              </div>
              {appError.statusCode && (
                <div>
                  <strong>Status:</strong> {appError.statusCode}
                </div>
              )}
              {appError.details && (
                <div>
                  <strong>Detalhes:</strong> {JSON.stringify(appError.details, null, 2)}
                </div>
              )}
              <div>
                <strong>Erro Original:</strong>{' '}
                {appError.originalError?.message || 'N/A'}
              </div>
            </Box>
          </Collapse>
        </Box>
      )}
    </Alert>
  );
};

export default ErrorAlert;
