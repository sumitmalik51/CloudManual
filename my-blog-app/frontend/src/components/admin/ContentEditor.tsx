import React from 'react';
import RichTextEditor from './RichTextEditor';

interface ContentEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  mode?: 'rich' | 'markdown';
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing your content...',
  height = 400,
  mode = 'markdown'
}) => {
  if (mode === 'rich') {
    return (
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        height={height}
      />
    );
  }

  // Fallback to markdown textarea
  return (
    <div className="markdown-editor">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Content (Markdown)
        </label>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          You can use Markdown syntax. Preview will be shown on the blog post.
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg 
          focus:ring-2 focus:ring-primary-500 focus:border-transparent 
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
          font-mono text-sm resize-y`}
        style={{ height: `${height}px`, minHeight: '200px' }}
      />
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <strong>Markdown Quick Reference:</strong><br />
        **bold** *italic* `code` 
        <br />
        # Heading 1 ## Heading 2 ### Heading 3
        <br />
        [link](url) ![image](url) &gt; blockquote
        <br />
        - List item 1. Numbered list ```code block```
      </div>
    </div>
  );
};

export default ContentEditor;
