/**
 * LunaBloom UI Component Library
 * Import from here, not from individual component files.
 *
 * Usage:
 *   import { Button, Card, Text, Badge } from '@/presentation/components/ui';
 *
 * Components:
 *   Layout & Containers: Card
 *   Typography:          Text, Heading
 *   Inputs:              TextInput
 *   Actions:             Button, IconButton, FloatingActionButton
 *   Selection:           Chip
 *   Display:             Badge, ProgressBar, Avatar
 *   Structure:           SectionHeader
 *   States:              EmptyState, LoadingState, ErrorState
 */

// Actions
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { IconButton } from './IconButton';
export type { IconButtonProps, IconButtonVariant, IconButtonSize } from './IconButton';

export { FloatingActionButton } from './FloatingActionButton';
export type { FloatingActionButtonProps, FABSize } from './FloatingActionButton';

// Layout & Containers
export { Card } from './Card';
export type { CardProps } from './Card';

// Typography
export { Text } from './Text';
export type { TextProps, TextVariant, TextColor, TextWeight } from './Text';

export { Heading } from './Heading';
export type { HeadingProps, HeadingLevel, HeadingColor } from './Heading';

// Inputs
export { TextInput } from './TextInput';
export type { TextInputProps } from './TextInput';

// Selection & Tagging
export { Chip } from './Chip';
export type { ChipProps, ChipColorVariant } from './Chip';

// Display
export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant, BadgeSize } from './Badge';

export { ProgressBar } from './ProgressBar';
export type { ProgressBarProps } from './ProgressBar';

export { Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';

// Structure
export { SectionHeader } from './SectionHeader';
export * from './NumberStepper';
export type { SectionHeaderProps } from './SectionHeader';

// States
export { EmptyState } from './EmptyState';
export type { EmptyStateProps, EmptyStateAction } from './EmptyState';

export { LoadingState } from './LoadingState';
export type { LoadingStateProps } from './LoadingState';

export { ErrorState } from './ErrorState';
export type { ErrorStateProps } from './ErrorState';

// Modals
export { AlertModal } from './AlertModal';
export { BottomPickerModal } from './BottomPickerModal';
export { TimePickerModal } from './TimePickerModal';

export { DatePickerModal } from './DatePickerModal';
