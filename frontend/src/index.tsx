import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { store } from './store/store';
import { performanceMonitor } from './utils/performance';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// Initialize performance monitoring
performanceMonitor.measurePageLoad();

// Report Web Vitals
reportWebVitals((metric) => {
  // Log Web Vitals
  console.log(`📊 Web Vital: ${metric.name} = ${metric.value.toFixed(2)}`);
  
  // In production, send to analytics service
  // Example: analytics.track('web_vital', metric);
});

// Log performance summary after 10 seconds (development only)
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    performanceMonitor.logSummary();
  }, 10000);
}
