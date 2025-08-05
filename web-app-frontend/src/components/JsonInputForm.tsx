import { Alert } from 'react-bootstrap';
import AceEditor from 'react-ace';
import React, { useEffect, useRef, useState } from 'react';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { loadSettings } from '../settings/utils';
import '../const/ace.imports'
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { IAceEditor } from 'react-ace/lib/types';

const draft06MetaSchema = require('ajv/lib/refs/json-schema-draft-06.json');

export interface JsonInputFormProps {
  jsonSchemaProvider: () => any;
  showMode: 'both' | 'builder' | 'json';
}

const JsonInputForm: React.FC<JsonInputFormProps> = ({
                                                       jsonSchemaProvider,
                                                       showMode
                                                     }) => {
  const [validationSuccess, setValidationSuccess] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationData, setValidationData] = useState('');

  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(true);
  const settings = loadSettings();
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

  const validateAgainstSchema = () => {
    setValidationSuccess(false);
    try {
      const dataToValidate = JSON.parse(validationData);
      const jsonSchema = jsonSchemaProvider();
      let validate;
      if (jsonSchema.$schema === 'https://json-schema.org/draft/2019-09/schema') {
        const ajv2019 = new Ajv2019({ allErrors: true })
        addFormats(ajv2019);
        validate = ajv2019.compile(jsonSchema);
      } else if (jsonSchema.$schema === 'https://json-schema.org/draft/2020-12/schema') {
        const ajv2020 = new Ajv2020({ allErrors: true })
        addFormats(ajv2020);
        validate = ajv2020.compile(jsonSchema);
      } else {
        const ajv = new Ajv({ allErrors: true });
        ajv.addMetaSchema(draft06MetaSchema);
        addFormats(ajv);
        validate = ajv.compile(jsonSchema);
      }
      const valid = validate(dataToValidate);

      const errors: string[] = [];

      if (!valid && validate.errors) {
        errors.push(...validate.errors.map(e => {
          if (e.keyword === 'additionalProperties' && 'additionalProperty' in e.params) {
            const propName = e.params.additionalProperty;
            return `${e.message}: '${propName}'`;
          }
          if (e.schemaPath) {
            return `'${e.schemaPath}': ${e.message}`;
          }
          return `${e.message}`;
        }));
      }

      setValidationErrors(errors);
      if (errors.length > 0) {
        console.error('Validation errors:', errors);
      } else {
        setValidationSuccess(true);
      }
    } catch (e) {
      setValidationErrors([`Invalid JSON: ${(e as Error).message}`]);
    }
  };

  const beautifyData = () => {
    try {
      const dataToValidate = JSON.parse(validationData);
      setValidationData(JSON.stringify(dataToValidate, null, 4));
      setValidationErrors([]);
    } catch (e) {
      setValidationErrors([`Invalid JSON: ${(e as Error).message}`]);
    }
  };

  return (
    <div onContextMenu={handleContextMenu} style={{ position: 'relative' }}>
      <AceEditor
        mode={'json'}
        theme={settings['aceTheme'].value}
        onLoad={handleLoad}
        name={`json-input`}
        value={validationData}
        onChange={(value) => setValidationData(value)}
        className={`rounded border mb-2 ${
          validationErrors.length === 0 ? 'border-success' : 'border-danger'
        }`}
        placeholder="Enter JSON to validate"
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
          <hr style={{ margin: '4px 0' }} />
          <div
            onClick={() => beautifyData()}
            style={{ padding: '8px', cursor: 'pointer', userSelect: 'none' }}
          >
            Beautify
          </div>
          <div
            onClick={() => validateAgainstSchema()}
            style={{ padding: '8px', cursor: 'pointer', userSelect: 'none' }}
          >
            Validate
          </div>
        </div>
      )}
      <div className="mt-2">
        {validationErrors.length > 0 && (
          <>
            {validationErrors.map((error, i) => (
              <Alert key={i} variant="danger" dismissible>
                {error}
              </Alert>
            ))}
          </>
        )}
        {validationSuccess && (
          <Alert variant={'success'} dismissible>
            JSON is valid
          </Alert>
        )}
      </div>
    </div>
  );
}

export default JsonInputForm;
