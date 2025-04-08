import { Group, Burger, Title, ActionIcon, Tooltip, Badge } from '@mantine/core'
import { IconWifi, IconBrightness, IconHelp, IconSettings } from '@tabler/icons-react'

/**
 * TopNavbar - Main navigation header component
 * 
 * Displays the app title, navigation controls, and utility actions
 * 
 * @param {Object} props - Component properties
 * @param {boolean} props.opened - Whether the sidebar is opened (mobile view)
 * @param {Function} props.toggle - Function to toggle the sidebar
 */
export function TopNavbar({ opened, toggle }: { opened: boolean; toggle: () => void }) {
  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Group>
          <IconWifi size={24} />
          <Title order={3}>Waterman</Title>
          <Badge variant="light" size="sm">WebSocket</Badge>
        </Group>
      </Group>
      
      <Group>
        <Tooltip label="Settings">
          <ActionIcon variant="subtle" size="md">
            <IconSettings size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Toggle theme">
          <ActionIcon variant="subtle" size="md">
            <IconBrightness size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Help">
          <ActionIcon variant="subtle" size="md">
            <IconHelp size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  )
} 