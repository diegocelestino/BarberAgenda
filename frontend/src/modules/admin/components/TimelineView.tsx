import React, { useEffect, useRef } from 'react';
import { Typography, Tag, Grid } from 'antd';
import { statusConfig } from '../types';

const { Text } = Typography;

export interface TimelineAppointment {
  id: string;
  startTime: number;  // epoch ms
  endTime: number;    // epoch ms
  customer: string;
  phone?: string;
  service: string;
  barber: string;
  status: 'confirmed' | 'in-progress' | 'pending' | 'cancelled';
}

interface TimelineViewProps {
  appointments: TimelineAppointment[];
  startHour?: number;   // default 8
  endHour?: number;     // default 21
  onAppointmentClick?: (appointment: TimelineAppointment) => void;
}

const HOUR_HEIGHT = 60; // px per hour

const TimelineView: React.FC<TimelineViewProps> = ({
  appointments,
  startHour = 8,
  endHour = 21,
  onAppointmentClick,
}) => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const containerRef = useRef<HTMLDivElement>(null);
  const totalHours = endHour - startHour;

  // Scroll to current time on mount
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    if (containerRef.current && currentHour >= startHour && currentHour <= endHour) {
      const scrollTo = (currentHour - startHour - 1) * HOUR_HEIGHT;
      containerRef.current.scrollTop = Math.max(0, scrollTo);
    }
  }, [startHour, endHour]);

  // Calculate "now" line position
  const now = new Date();
  const nowHour = now.getHours() + now.getMinutes() / 60;
  const showNowLine = nowHour >= startHour && nowHour <= endHour;
  const nowTop = (nowHour - startHour) * HOUR_HEIGHT;

  // Generate time labels
  const timeSlots = [];
  for (let h = startHour; h <= endHour; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
  }

  // Position appointments with overlap detection
  const getAppointmentStyle = (appt: TimelineAppointment) => {
    const startDate = new Date(appt.startTime);
    const endDate = new Date(appt.endTime);
    const startH = startDate.getHours() + startDate.getMinutes() / 60;
    const endH = endDate.getHours() + endDate.getMinutes() / 60;
    const top = (startH - startHour) * HOUR_HEIGHT;
    const height = Math.max((endH - startH) * HOUR_HEIGHT - 2, 20);
    return { top, height };
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: '#1677ff',
      'in-progress': '#50c878',
      pending: '#faad14',
      cancelled: '#ff4d4f',
    };
    return colors[status] || '#555';
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        height: isMobile ? '60vh' : '70vh',
        overflow: 'auto',
        border: '1px solid #333',
        borderRadius: 4,
      }}
    >
      <div style={{ position: 'relative', height: totalHours * HOUR_HEIGHT + HOUR_HEIGHT }}>
        {/* Time grid lines + labels */}
        {timeSlots.map((label, i) => (
          <div
            key={label}
            style={{
              position: 'absolute',
              top: i * HOUR_HEIGHT,
              left: 0,
              right: 0,
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            <div style={{
              width: isMobile ? 40 : 56,
              flexShrink: 0,
              paddingTop: 2,
              paddingRight: 8,
              textAlign: 'right',
            }}>
              <Text type="secondary" style={{ fontSize: 11 }}>{label}</Text>
            </div>
            <div style={{
              flex: 1,
              borderTop: '1px solid #2a2a2a',
              height: HOUR_HEIGHT,
            }} />
          </div>
        ))}

        {/* Now line */}
        {showNowLine && (
          <div style={{
            position: 'absolute',
            top: nowTop,
            left: isMobile ? 40 : 56,
            right: 0,
            height: 2,
            backgroundColor: '#ff4d4f',
            zIndex: 10,
          }}>
            <div style={{
              position: 'absolute',
              left: -4,
              top: -3,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#ff4d4f',
            }} />
          </div>
        )}

        {/* Appointments */}
        {(() => {
          // Calculate overlap columns
          const sorted = [...appointments].sort((a, b) => a.startTime - b.startTime);
          const columns: TimelineAppointment[][] = [];

          sorted.forEach((appt) => {
            let placed = false;
            for (const col of columns) {
              const last = col[col.length - 1];
              if (last.endTime <= appt.startTime) {
                col.push(appt);
                placed = true;
                break;
              }
            }
            if (!placed) columns.push([appt]);
          });

          // Map each appointment to its column index and total columns in its group
          const layoutMap = new Map<string, { colIndex: number; totalCols: number }>();
          sorted.forEach((appt) => {
            const colIndex = columns.findIndex((col) => col.includes(appt));
            // Find how many columns overlap at this appointment's time
            let totalCols = 0;
            columns.forEach((col) => {
              const hasOverlap = col.some((other) =>
                other.startTime < appt.endTime && other.endTime > appt.startTime
              );
              if (hasOverlap) totalCols++;
            });
            layoutMap.set(appt.id, { colIndex, totalCols: Math.max(totalCols, 1) });
          });

          const leftOffset = isMobile ? 48 : 64;
          const rightPad = 8;

          return sorted.map((appt) => {
            const { top, height } = getAppointmentStyle(appt);
            const color = getStatusColor(appt.status);
            const layout = layoutMap.get(appt.id) || { colIndex: 0, totalCols: 1 };
            const colWidth = `calc((100% - ${leftOffset + rightPad}px) / ${layout.totalCols})`;
            const colLeft = `calc(${leftOffset}px + (100% - ${leftOffset + rightPad}px) * ${layout.colIndex} / ${layout.totalCols})`;

            return (
              <div
                key={appt.id}
                onClick={() => onAppointmentClick?.(appt)}
                style={{
                  position: 'absolute',
                  top,
                  left: colLeft,
                  width: colWidth,
                  height,
                  backgroundColor: `${color}20`,
                  borderLeft: `3px solid ${color}`,
                  borderRadius: 4,
                  padding: '4px 8px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  zIndex: 5,
                  boxSizing: 'border-box',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${color}35`; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${color}20`; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                  <Text style={{ fontSize: 12 }} ellipsis>
                    <Text strong style={{ fontSize: 12 }}>{appt.service}</Text> — {appt.customer}
                  </Text>
                  <Tag color={statusConfig[appt.status]?.color} style={{ fontSize: 9, margin: 0, marginLeft: 4, lineHeight: '14px', padding: '0 4px', flexShrink: 0 }}>
                    {statusConfig[appt.status]?.label}
                  </Tag>
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
};

export default TimelineView;
