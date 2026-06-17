import { createContext, useContext, useState, type ReactNode } from 'react'
import styles from './Tabs.module.scss'

interface TabsContextValue {
  active: string
  setActive: (id: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Komponenty Tabs muszą być wewnątrz <Tabs>')
  return ctx
}

export interface TabsProps {
  defaultTab: string
  children: ReactNode
  className?: string
}

export function Tabs({ defaultTab, children, className = '' }: TabsProps) {
  const [active, setActive] = useState(defaultTab)
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={`${styles.tabs} ${className}`}>{children}</div>
    </TabsContext.Provider>
  )
}

function TabList({ children }: { children: ReactNode }) {
  return (
    <div className={styles.list} role="tablist">
      {children}
    </div>
  )
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { active, setActive } = useTabs()
  const selected = active === id
  return (
    <button
      role="tab"
      id={`tab-${id}`}
      aria-controls={`panel-${id}`}
      aria-selected={selected}
      className={`${styles.tab} ${selected ? styles.active : ''}`}
      onClick={() => setActive(id)}
    >
      {children}
    </button>
  )
}

function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { active } = useTabs()
  if (active !== id) return null
  return (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} className={styles.panel}>
      {children}
    </div>
  )
}

Tabs.List = TabList
Tabs.Tab = Tab
Tabs.Panel = TabPanel

Tabs.displayName = 'Tabs'
TabList.displayName = 'Tabs.List'
Tab.displayName = 'Tabs.Tab'
TabPanel.displayName = 'Tabs.Panel'
