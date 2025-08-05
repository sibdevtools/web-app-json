import React, { useRef, useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import { loadSettings } from '../settings/utils';

import '../const/ace.imports';
import { IAceEditor } from 'react-ace/lib/types';

export interface SchemaTextEditorProps {
  textSchema: string;
  setTextSchema: (value: string) => void;
  schemaValidationErrors: string[];
}

const SchemaTextEditor: React.FC<SchemaTextEditorProps> = ({
                                                             textSchema,
                                                             setTextSchema,
                                                             schemaValidationErrors,
                                                           }) => {
  const settings = loadSettings();
  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(true);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const editorRef = useRef<IAceEditor | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  const handleLoad = (editor: IAceEditor) => {
    editorRef.current = editor;

    editor.commands.addCommand({
      name: 'openSearch',
      bindKey: { win: 'Ctrl-F', mac: 'Command-F' },
      exec: (editor) => editor.execCommand('find'),
    });

    editor.commands.addCommand({
      name: 'openReplace',
      bindKey: { win: 'Ctrl-H', mac: 'Command-H' },
      exec: (editor) => editor.execCommand('replace'),
    });
  };

  const handleEditorCommand = async (command: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();

    switch (command) {
      case 'cut': {
        const selectedText = editor.getSelectedText();
        if (selectedText) {
          await navigator.clipboard.writeText(selectedText);
          selection.clearSelection();
          editor.insert('');
        }
        break;
      }
      case 'copy': {
        const selectedText = editor.getSelectedText();
        if (selectedText) {
          await navigator.clipboard.writeText(selectedText);
        }
        break;
      }
      case 'paste': {
        try {
          const clipboardText = await navigator.clipboard.readText();
          editor.insert(clipboardText);
        } catch (err) {
          console.error('Clipboard paste failed: ', err);
        }
        break;
      }
      case 'selectAll':
        editor.selectAll();
        break;
      case 'toggleWrap':
        setIsWordWrapEnabled((prev) => !prev);
        break;
    }

    setMenuPosition(null);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setMenuPosition({ x: event.clientX, y: event.clientY });
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setMenuPosition(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div onContextMenu={handleContextMenu} style={{ position: 'relative' }}>
      <AceEditor
        mode={'json'}
        theme={settings['aceTheme'].value}
        onLoad={handleLoad}
        name={`schema-representation`}
        value={textSchema}
        onChange={setTextSchema}
        className={`rounded border ${
          schemaValidationErrors.length === 0 ? 'border-success' : 'border-danger'
        }`}
        placeholder="Enter JSON Schema"
        style={{
          resize: 'vertical',
          overflow: 'auto',
          height: '480px',
          minHeight: '200px',
        }}
        fontSize={14}
        width="100%"
        height="480px"
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        wrapEnabled={isWordWrapEnabled}
        setOptions={{
          showLineNumbers: true,
          wrap: isWordWrapEnabled,
          useWorker: false,
        }}
        editorProps={{ $blockScrolling: true }}
      />

      {/* Custom Context Menu */}
      {menuPosition && (
        <div
          ref={contextMenuRef}
          style={{
            position: 'fixed',
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x}px`,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 9999,
            width: '160px',
          }}
        >
          <div
            onClick={() => handleEditorCommand('cut')}
            style={{ padding: '8px', cursor: 'pointer', userSelect: 'none' }}
          >
            Cut
          </div>
          <div
            onClick={() => handleEditorCommand('copy')}
            style={{ padding: '8px', cursor: 'pointer', userSelect: 'none' }}
          >
            Copy
          </div>
          <div
            onClick={() => handleEditorCommand('paste')}
            style={{ padding: '8px', cursor: 'pointer', userSelect: 'none' }}
          >
            Paste
          </div>
          <div
            onClick={() => handleEditorCommand('selectAll')}
            style={{ padding: '8px', cursor: 'pointer', userSelect: 'none' }}
          >
            Select All
          </div>
          <hr style={{ margin: '4px 0' }} />
          <div
            onClick={() => handleEditorCommand('toggleWrap')}
            style={{ padding: '8px', cursor: 'pointer', userSelect: 'none' }}
          >
            {isWordWrapEnabled ? 'Unwrap' : 'Wrap'}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemaTextEditor;
