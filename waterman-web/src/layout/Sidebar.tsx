import { 
  Stack, 
  Text, 
  Group, 
  UnstyledButton, 
  Divider, 
  ScrollArea,
  Badge,
} from '@mantine/core'
import { 
  IconTable,
  IconChartLine,
  IconBug,
  IconSchema,
  IconChartBar,
  IconSettings
} from '@tabler/icons-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useArrowWebSocket } from '../hooks/useArrowWebSocket'
import { ConnectionSettings } from '../components/ConnectionSettings'

/**
 * NavbarLink - Navigation link component for sidebar
 */
function NavbarLink({ 
  icon: Icon, 
  label, 
  to, 
  count 
}: { 
  icon: React.ElementType; 
  label: string; 
  to: string; 
  count?: number 
}) {
  return (
    <NavLink 
      to={to}
      style={{ textDecoration: 'none' }}
    >
      {({ isActive }) => (
        <UnstyledButton
          style={{
            display: 'block',
            width: '100%',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            backgroundColor: isActive ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
          }}
        >
          <Group gap="xs">
            <Icon size={16} />
            <Text size="sm">{label}</Text>
            {count !== undefined && count > 0 && (
              <Badge size="xs" variant="filled">
                {count}
              </Badge>
            )}
          </Group>
        </UnstyledButton>
      )}
    </NavLink>
  )
}

/**
 * Sidebar - Main sidebar navigation component
 * 
 * Provides navigation between views and WebSocket connection options
 */
export function Sidebar() {
  const location = useLocation()
  const [activeLink, setActiveLink] = useState(location.pathname)
  const { isConnected, connect, disconnect, error } = useArrowWebSocket();
  
  // Handle connect with the required URL parameter
  const handleConnect = (url: string) => {
    connect(url);
  };
  
  // Update active link when location changes
  useEffect(() => {
    setActiveLink(location.pathname)
  }, [location.pathname])
  
  return (
    <Stack h="100%" gap={0}>
      <ScrollArea flex={1}>
        <Stack gap="xs">
          <Text size="xs" fw={500} c="dimmed" tt="uppercase" mb={5}>Navigation</Text>
                      
          <NavbarLink
            icon={IconChartBar}
            label="Stats"
            to="/stats"
          />
          
          <NavbarLink
            icon={IconTable}
            label="Data"
            to="/data"
          />

          
          <NavbarLink
            icon={IconSchema}
            label="Schema"
            to="/schema"
          />
        </Stack>
      </ScrollArea>
      
      <Divider my="md" />
      
      <ConnectionSettings 
        onConnect={handleConnect}
        onDisconnect={disconnect}
        isConnected={isConnected}
        error={error}
        compact={true}
      />
    </Stack>
  )
} 