import React from "react";
import { cn } from "@/lib/utils";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
);
TableHeader.displayName = "TableHeader";

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
);
TableBody.displayName = "TableBody";

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn("bg-gray-50 dark:bg-gray-900 font-medium text-gray-900 dark:text-gray-50", className)}
      {...props}
    />
  )
);
TableFooter.displayName = "TableFooter";

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50 data-[state=selected]:bg-gray-100 dark:data-[state=selected]:bg-gray-800",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-10 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";

interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {}

const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn("mt-4 text-sm text-gray-500 dark:text-gray-400", className)}
      {...props}
    />
  )
);
TableCaption.displayName = "TableCaption";

// Export the components
Table.Header = TableHeader;
Table.Body = TableBody;
Table.Footer = TableFooter;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;
Table.Caption = TableCaption;

export { Table }; 