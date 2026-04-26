import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { logError } from '../../utils/errorHandler';

const { Paragraph, Text } = Typography;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, 'ErrorBoundary');
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <Result
            status="error"
            title="Algo deu errado"
            subTitle="Desculpe, ocorreu um erro inesperado. Por favor, tente recarregar a página."
            extra={[
              <Button key="reset" onClick={this.handleReset}>Tentar Novamente</Button>,
              <Button key="reload" type="primary" icon={<ReloadOutlined />} onClick={this.handleReload}>
                Recarregar Página
              </Button>,
            ]}
          >
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: 16, textAlign: 'left', overflow: 'auto', maxHeight: 300 }}>
                <Paragraph>
                  <Text strong>Error:</Text> <Text code>{this.state.error.toString()}</Text>
                </Paragraph>
                {this.state.errorInfo && (
                  <Paragraph>
                    <Text strong>Component Stack:</Text>
                    <pre style={{ fontSize: 12 }}>{this.state.errorInfo.componentStack}</pre>
                  </Paragraph>
                )}
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
