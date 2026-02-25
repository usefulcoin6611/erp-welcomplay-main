'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    [{ align: [] }],
    ['clean'],
  ],
  clipboard: { matchVisual: false },
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list',
  'link',
  'align',
];

type RichTextEditorProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
  className?: string;
};

export function RichTextEditor({
  id,
  value,
  onChange,
  label,
  placeholder = 'Tulis konten...',
  minHeight = '200px',
  disabled = false,
  className = '',
}: RichTextEditorProps) {
  const quillModules = useMemo(() => modules, []);

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} className="mb-2 block">
          {label}
        </Label>
      )}
      <div className="rounded-md border border-input bg-background [&_.ql-toolbar]:rounded-t-md [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-input [&_.ql-toolbar]:bg-muted/30 [&_.ql-container]:rounded-b-md [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[var(--min-height)] [&_.ql-editor.ql-blank::before]:text-muted-foreground">
        <ReactQuill
          id={id}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={quillModules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          style={{ ['--min-height' as string]: minHeight }}
          className="[&_.ql-editor]:min-h-[200px]"
        />
      </div>
    </div>
  );
}
