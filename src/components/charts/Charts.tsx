'use client';

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
  Legend, ScatterChart, Scatter, ZAxis,
} from 'recharts';
import ClientOnly from './ClientOnly';
import { formatMonth } from '@/lib/utils';

/* Palette - brand-neutral, works on the portal's light ground and prints. */
export const C = {
  navy: '#0b2d5c',
  navyLight: '#14447f',
  saffron: '#d97a1f',
  green: '#1b7a3d',
  red: '#b3261e',
  grey: '#5f6773',
  amber: '#94620a',
  teal: '#0f6b74',
  grid: '#dfe2e8',
  axis: '#5f6773',
};

const TOOLTIP_STYLE = {
  backgroundColor: '#ffffff',
  border: '1px solid #b0b5c0',
  borderRadius: 2,
  fontSize: 12,
  fontFamily: 'var(--font-ibm-plex)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

const AXIS = { stroke: C.axis, fontSize: 11, tickLine: false, axisLine: false } as const;

/* ---------------- Demand over time, with supply reference ---------------- */
export function TrendArea({
  data, supplyLine, height = 260, label = 'Verified vacancies',
}: {
  data: { month: string; postingsCount: number }[];
  supplyLine?: number;
  height?: number;
  label?: string;
}) {
  return (
    <ClientOnly height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="gradNavy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.navy} stopOpacity={0.55} />
              <stop offset="100%" stopColor={C.navy} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" vertical={false} stroke={C.grid} />
          <XAxis dataKey="month" tickFormatter={formatMonth} {...AXIS} tickMargin={8} />
          <YAxis {...AXIS} width={46} tickFormatter={v => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelFormatter={(v) => formatMonth(String(v))}
            formatter={(v) => [Number(v), label]}
          />
          {supplyLine !== undefined && (
            <ReferenceLine
              y={supplyLine} stroke={C.green} strokeDasharray="4 3" strokeWidth={1.5}
              label={{ position: 'insideTopRight', value: 'Annual training supply', fill: C.green, fontSize: 10.5, fontWeight: 600 }}
            />
          )}
          <Area type="monotone" dataKey="postingsCount" stroke={C.navy} strokeWidth={2} fill="url(#gradNavy)" />
        </AreaChart>
      </ResponsiveContainer>
    </ClientOnly>
  );
}

/* ---------------- Horizontal gap bars, coloured by trend ---------------- */
export function GapBars({
  data, height = 320,
}: {
  data: { skillName: string; gap: number; trend: 'rising' | 'stable' | 'declining' }[];
  height?: number;
}) {
  const tone = (t: string) => (t === 'rising' ? C.green : t === 'declining' ? C.red : C.grey);
  return (
    <ClientOnly height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="2 4" horizontal={false} stroke={C.grid} />
          <XAxis type="number" {...AXIS} tickFormatter={v => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)} />
          <YAxis type="category" dataKey="skillName" {...AXIS} width={148} fontSize={10.5} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [Number(v) > 0 ? `${Number(v)} short` : `${Math.abs(Number(v))} surplus`, 'Annual gap']} />
          <ReferenceLine x={0} stroke={C.axis} />
          <Bar dataKey="gap" radius={[0, 2, 2, 0]} barSize={13}>
            {data.map((d, i) => <Cell key={i} fill={tone(d.trend)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ClientOnly>
  );
}

/* ---------------- Capacity ceilings - which constraint binds ---------------- */
export function CeilingBars({
  data, hardLimit, notified, height = 260,
}: {
  data: { name: string; value: number; binding: boolean }[];
  hardLimit: number;
  notified: number;
  height?: number;
}) {
  return (
    <ClientOnly height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 16, left: -8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="2 4" vertical={false} stroke={C.grid} />
          <XAxis dataKey="name" {...AXIS} fontSize={10.5} interval={0} />
          <YAxis {...AXIS} width={48} tickFormatter={v => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${Number(v).toLocaleString('en-IN')} seats`, 'Ceiling']} />
          <ReferenceLine y={notified} stroke={C.red} strokeDasharray="4 3" strokeWidth={1.5}
            label={{ position: 'insideTopLeft', value: `Notified: ${notified.toLocaleString('en-IN')}`, fill: C.red, fontSize: 10.5, fontWeight: 600 }} />
          <ReferenceLine y={hardLimit} stroke={C.green} strokeWidth={1.5}
            label={{ position: 'insideBottomLeft', value: `Hard limit: ${hardLimit.toLocaleString('en-IN')}`, fill: C.green, fontSize: 10.5, fontWeight: 600 }} />
          <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={44}>
            {data.map((d, i) => <Cell key={i} fill={d.binding ? C.red : C.navyLight} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ClientOnly>
  );
}

/* ---------------- A/B experiment comparison ---------------- */
export function ExperimentBars({
  data, height = 250,
}: {
  data: { metric: string; 'Arm A': number; 'Arm B': number }[];
  height?: number;
}) {
  return (
    <ClientOnly height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 4 }}>
          <CartesianGrid strokeDasharray="2 4" vertical={false} stroke={C.grid} />
          <XAxis dataKey="metric" {...AXIS} fontSize={10.5} interval={0} />
          <YAxis {...AXIS} width={44} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 11.5, paddingTop: 6 }} />
          <Bar dataKey="Arm A" fill={C.grey} radius={[2, 2, 0, 0]} barSize={22} />
          <Bar dataKey="Arm B" fill={C.green} radius={[2, 2, 0, 0]} barSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </ClientOnly>
  );
}

/* ---------------- Skill profile radar ---------------- */
export function SkillRadar({
  data, height = 270, seriesA = 'You now', seriesB = 'Target role',
}: {
  data: { axis: string; a: number; b: number }[];
  height?: number; seriesA?: string; seriesB?: string;
}) {
  return (
    <ClientOnly height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke={C.grid} />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10.5, fill: C.axis }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9.5, fill: C.axis }} axisLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 11.5 }} />
          <Radar name={seriesB} dataKey="b" stroke={C.saffron} fill={C.saffron} fillOpacity={0.18} strokeWidth={1.8} />
          <Radar name={seriesA} dataKey="a" stroke={C.navy} fill={C.navy} fillOpacity={0.3} strokeWidth={1.8} />
        </RadarChart>
      </ResponsiveContainer>
    </ClientOnly>
  );
}

/* ---------------- Trust scatter: claimed vs confirmed ---------------- */
export function TrustScatter({
  data, height = 300,
}: {
  data: { name: string; trust: number; confirmRate: number; volume: number }[];
  height?: number;
}) {
  return (
    <ClientOnly height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 12, right: 20, left: -6, bottom: 16 }}>
          <CartesianGrid strokeDasharray="2 4" stroke={C.grid} />
          <XAxis type="number" dataKey="trust" domain={[0, 100]} {...AXIS}
            label={{ value: 'Trust score', position: 'insideBottom', offset: -10, fontSize: 11, fill: C.axis }} />
          <YAxis type="number" dataKey="confirmRate" domain={[0, 100]} {...AXIS} width={44}
            label={{ value: 'Payroll-confirmed %', angle: -90, position: 'insideLeft', offset: 14, fontSize: 11, fill: C.axis }} />
          <ZAxis type="number" dataKey="volume" range={[50, 520]} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(v, n) => [String(n) === 'volume' ? `${Number(v).toLocaleString('en-IN')} signals` : `${Number(v)}%`, String(n)]}
            labelFormatter={() => ''}
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0].payload as { name: string; trust: number; confirmRate: number; volume: number };
              return (
                <div style={TOOLTIP_STYLE} className="px-2.5 py-2">
                  <p className="font-bold text-[12px]">{d.name}</p>
                  <p className="text-[11.5px]">Trust score: {d.trust}</p>
                  <p className="text-[11.5px]">Payroll-confirmed: {d.confirmRate}%</p>
                  <p className="text-[11.5px]">Volume: {d.volume.toLocaleString('en-IN')} signals</p>
                </div>
              );
            }}
          />
          <ReferenceLine x={55} stroke={C.amber} strokeDasharray="4 3"
            label={{ value: 'Verification threshold', fontSize: 10, fill: C.amber, position: 'top' }} />
          <Scatter data={data} fill={C.navy}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.trust >= 80 ? C.green : d.trust >= 55 ? C.navyLight : d.trust >= 30 ? C.amber : C.red} fillOpacity={0.72} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </ClientOnly>
  );
}

/* ---------------- Multi-series district comparison ---------------- */
export function DistrictLines({
  data, series, height = 280,
}: {
  data: Record<string, string | number>[];
  series: { key: string; name: string; color: string }[];
  height?: number;
}) {
  return (
    <ClientOnly height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 20, left: -10, bottom: 4 }}>
          <CartesianGrid strokeDasharray="2 4" vertical={false} stroke={C.grid} />
          <XAxis dataKey="month" tickFormatter={v => formatMonth(String(v))} {...AXIS} />
          <YAxis {...AXIS} width={44} />
          <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={v => formatMonth(String(v))} />
          <Legend wrapperStyle={{ fontSize: 11.5, paddingTop: 6 }} />
          {series.map(s => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color}
              strokeWidth={1.9} dot={false} activeDot={{ r: 4 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ClientOnly>
  );
}

/* ---------------- Stacked district composition ---------------- */
export function StackedBars({
  data, series, xKey = 'name', height = 300,
}: {
  data: Record<string, string | number>[];
  series: { key: string; name: string; color: string }[];
  xKey?: string;
  height?: number;
}) {
  return (
    <ClientOnly height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="2 4" vertical={false} stroke={C.grid} />
          <XAxis dataKey={xKey} {...AXIS} fontSize={10.5} interval={0} />
          <YAxis {...AXIS} width={46} tickFormatter={v => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 11.5, paddingTop: 6 }} />
          {series.map(s => (
            <Bar key={s.key} dataKey={s.key} name={s.name} stackId="a" fill={s.color} barSize={38} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ClientOnly>
  );
}
