import { Spin } from 'antd';

interface CenteredSpinProps {
  minHeight?: number;
}

const CenteredSpin: React.FC<CenteredSpinProps> = ({ minHeight = 200 }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight }}>
    <Spin size="large" />
  </div>
);

export default CenteredSpin;
