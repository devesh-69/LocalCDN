import { ButtonHTMLAttributes, forwardRef } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-dark',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-neutral-200 hover:bg-neutral-100 hover:text-primary',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        ghost: 'hover:bg-neutral-100 hover:text-primary',
        link: 'text-primary underline-offset-4 hover:underline',
        accent: 'bg-accent text-white hover:bg-amber-600',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants }; 