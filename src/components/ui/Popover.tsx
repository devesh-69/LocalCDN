'use client';

import React, { useState, useRef, useEffect, ReactNode, HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  trigger: ReactNode;
  children: ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

/**
 * Popover component for displaying content in a floating panel
 */
export const PopoverComponent = ({
  trigger,
  children,
  position = 'bottom',
  className,
  open: controlledOpen,
  onOpenChange,
  ...props
}: PopoverProps) => {
  const [open, setOpen] = useState(controlledOpen || false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Handle controlled state
  useEffect(() => {
    if (controlledOpen !== undefined) {
      setOpen(controlledOpen);
    }
  }, [controlledOpen]);
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current && 
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node)
      ) {
        setInternalOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);
  
  // Handle escape key to close
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setInternalOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [open]);
  
  // Set initial mounted state
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Update position when content changes
  useEffect(() => {
    if (open && triggerRef.current && contentRef.current) {
      updatePosition();
    }
  }, [open, children]);
  
  // Internal open state handler that calls the external handler
  const setInternalOpen = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };
  
  // Toggle open state
  const toggleOpen = () => {
    setInternalOpen(!open);
  };
  
  // Update content position based on trigger element
  const updatePosition = () => {
    if (!triggerRef.current || !contentRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    
    // Default position styles
    let top = 0;
    let left = 0;
    
    // Calculate position based on preferred position
    switch (position) {
      case 'top':
        top = triggerRect.top - contentRect.height - 8;
        left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2);
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (contentRect.height / 2);
        left = triggerRect.right + 8;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (contentRect.height / 2);
        left = triggerRect.left - contentRect.width - 8;
        break;
      case 'bottom':
      default:
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2);
        break;
    }
    
    // Adjust to keep within viewport
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Prevent overflow to the right
    if (left + contentRect.width > viewport.width - 10) {
      left = viewport.width - contentRect.width - 10;
    }
    
    // Prevent overflow to the left
    if (left < 10) {
      left = 10;
    }
    
    // Prevent overflow to the bottom
    if (top + contentRect.height > viewport.height - 10) {
      top = viewport.height - contentRect.height - 10;
    }
    
    // Prevent overflow to the top
    if (top < 10) {
      top = 10;
    }
    
    // Apply position
    contentRef.current.style.top = `${top}px`;
    contentRef.current.style.left = `${left}px`;
  };
  
  return (
    <>
      <div 
        ref={triggerRef} 
        onClick={toggleOpen}
        className="inline-block cursor-pointer"
      >
        {trigger}
      </div>
      
      {mounted && open && createPortal(
        <div
          ref={contentRef}
          className={`fixed z-50 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[200px] ${className || ''}`}
          {...props}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
};

export { Popover, PopoverTrigger, PopoverContent } 