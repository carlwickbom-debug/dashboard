import type { ReactNode } from 'react'

export function ChartContainer({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return <div className="chart-container"><header><div><strong>{title}</strong>{subtitle && <span>{subtitle}</span>}</div>{footer}</header><div className="chart-body">{children}</div></div>
}

export function MapContainer({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return <div className="map-container"><header><div><strong>{title}</strong>{subtitle && <span>{subtitle}</span>}</div>{footer}</header><div className="map-body">{children}</div></div>
}
