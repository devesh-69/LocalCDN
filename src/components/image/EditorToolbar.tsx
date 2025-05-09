'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { Separator } from '@/components/ui/Separator';
import { cn } from '@/lib/utils';
import {
  MousePointer,
  Crop,
  RotateCw,
  Layers,
  Maximize,
  Type,
  Square,
  Circle,
  Pencil,
  Undo,
  Redo,
} from 'lucide-react';

type EditorTool = 
  | 'select'
  | 'crop'
  | 'rotate'
  | 'flip'
  | 'resize'
  | 'text'
  | 'shape'
  | 'draw';

interface ToolDefinition {
  id: EditorTool;
  name: string;
  icon: React.ReactNode;
}

interface EditorToolbarProps {
  selectedTool: EditorTool;
  onToolSelect: (tool: EditorTool) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

// Define available tools
const tools: ToolDefinition[] = [
  {
    id: 'select',
    name: 'Select',
    icon: <MousePointer className="h-4 w-4" />,
  },
  {
    id: 'crop',
    name: 'Crop',
    icon: <Crop className="h-4 w-4" />,
  },
  {
    id: 'rotate',
    name: 'Rotate',
    icon: <RotateCw className="h-4 w-4" />,
  },
  {
    id: 'flip',
    name: 'Flip',
    icon: <Layers className="h-4 w-4" />,
  },
  {
    id: 'resize',
    name: 'Resize',
    icon: <Maximize className="h-4 w-4" />,
  },
  {
    id: 'text',
    name: 'Add Text',
    icon: <Type className="h-4 w-4" />,
  },
  {
    id: 'shape',
    name: 'Add Shape',
    icon: <Square className="h-4 w-4" />,
  },
  {
    id: 'draw',
    name: 'Draw',
    icon: <Pencil className="h-4 w-4" />,
  },
];

export function EditorToolbar({
  selectedTool,
  onToolSelect,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: EditorToolbarProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-2 flex items-center">
      <div className="flex items-center space-x-1">
        {tools.map((tool) => (
          <Tooltip key={tool.id} title={tool.name}>
            <Button
              variant={selectedTool === tool.id ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onToolSelect(tool.id)}
              className={cn(
                'h-8 w-8',
                selectedTool === tool.id && 'bg-gray-100 dark:bg-gray-800'
              )}
            >
              {tool.icon}
            </Button>
          </Tooltip>
        ))}
      </div>
      
      <Separator orientation="vertical" className="mx-2 h-6" />
      
      <div className="flex items-center space-x-1">
        <Tooltip title="Undo">
          <Button
            variant="ghost"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-8 w-8"
          >
            <Undo className="h-4 w-4" />
          </Button>
        </Tooltip>
        
        <Tooltip title="Redo">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-8 w-8"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
} 