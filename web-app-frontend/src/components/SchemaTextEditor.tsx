import { Alert, Row } from 'react-bootstrap';
import AceEditor from 'react-ace';
import React from 'react';
import { loadSettings } from '../settings/utils';

import '../const/ace.imports'
import { IAceEditor } from 'react-ace/lib/types';

export interface SchemaTextEditorProps {
  textSchema: string;
  setTextSchema: (value: string) => void;
  isWordWrapEnabled: boolean;
  validationErrors: string[];
  setValidationErrors: (errors: string[]) => void;
}

const SchemaTextEditor: React.FC<SchemaTextEditorProps> = ({
                                                             textSchema,
                                                             setTextSchema,
                                                             isWordWrapEnabled,
                                                             validationErrors,
                                                             setValidationErrors
                                                           }) => {
  const settings = loadSettings();

  const handleLoad = (editor: IAceEditor) => {
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

  return (
    <>
      {validationErrors.length > 0 && (
        <>
          {validationErrors.map((error, i) => (
            <Alert className={'m-2'} key={i} variant="danger" dismissible onClose={() => setValidationErrors([])}>
              {error}
            </Alert>
          ))}
        </>
      )}
      <Row>
        <AceEditor
          mode={'json'}
          theme={settings['aceTheme'].value}
          onLoad={handleLoad}
          name={`schema-representation`}
          value={textSchema}
          onChange={setTextSchema}
          className={`border ${(validationErrors.length === 0 ? 'border-success' : 'border-danger')}`}
          placeholder="Enter JSON Schema"
          style={{
            resize: 'vertical',
            overflow: 'auto',
            minHeight: '200px',
          }}
          fontSize={14}
          width="100%"
          height="640px"
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
      </Row>
    </>
  );
}

export default SchemaTextEditor;
