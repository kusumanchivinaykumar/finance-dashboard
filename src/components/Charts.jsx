import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppContext } from '../context/AppContext';

const pieColors = ['#2f7fff', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];

const money = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    value,
  );

function useElementSize() {
  const elementRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    };

    updateSize();

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(element);

    const rafId = window.requestAnimationFrame(updateSize);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  return [elementRef, size];
}

export default function Charts() {
  const { trendData, categoryData } = useAppContext();
  const isCompact = typeof window !== 'undefined' && window.innerWidth < 640;
  const [lineChartRef, lineChartSize] = useElementSize();
  const [pieChartRef, pieChartSize] = useElementSize();
  const pieOuterRadius = Math.max(
    isCompact ? 54 : 64,
    Math.min(pieChartSize.width, pieChartSize.height) * (isCompact ? 0.26 : 0.32),
  );

  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <motion.article
        className="glass min-w-0 p-5 xl:col-span-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="section-title">Balance Trend</h3>
        <div ref={lineChartRef} className="h-56 min-w-0 sm:h-64" style={{ minHeight: 220 }}>
          {lineChartSize.width > 0 && lineChartSize.height > 0 ? (
            <LineChart width={lineChartSize.width} height={lineChartSize.height} data={trendData}>
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} minTickGap={18} />
              <YAxis
                stroke="#94a3b8"
                tickFormatter={money}
                width={isCompact ? 50 : 72}
                tick={{ fontSize: isCompact ? 11 : 12 }}
              />
              <Tooltip formatter={(value) => money(value)} />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#2f7fff"
                strokeWidth={3}
                dot={{ r: 4, fill: '#2f7fff' }}
                activeDot={{ r: 6 }}
                isAnimationActive
                animationDuration={900}
                animationEasing="ease-out"
              />
            </LineChart>
          ) : (
            <div className="skeleton-shimmer h-full w-full rounded-xl" aria-hidden />
          )}
        </div>
      </motion.article>

      <motion.article
        className="glass min-w-0 p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
      >
        <h3 className="section-title">Spending by Category</h3>
        <div ref={pieChartRef} className="h-56 min-w-0 sm:h-64" style={{ minHeight: 220 }}>
          {pieChartSize.width > 0 && pieChartSize.height > 0 ? (
            <PieChart width={pieChartSize.width} height={pieChartSize.height}>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={pieOuterRadius}
                label
                isAnimationActive
                animationBegin={180}
                animationDuration={900}
                animationEasing="ease-out"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => money(value)} />
            </PieChart>
          ) : (
            <div className="skeleton-shimmer h-full w-full rounded-xl" aria-hidden />
          )}
        </div>
      </motion.article>
    </section>
  );
}
