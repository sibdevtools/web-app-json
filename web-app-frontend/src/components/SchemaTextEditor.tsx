import { Button, ButtonGroup, Col, Row } from 'react-bootstrap';
import AceEditor from 'react-ace';
import React, { useState } from 'react';
import { loadSettings } from '../settings/utils';

import '../const/ace.imports'
import { FluentTextWrap20Regular, FluentTextWrapOff20Regular } from '../const/icons';
import { IAceEditor } from 'react-ace/lib/types';

export interface SchemaTextEditorProps {
  textSchema: string;
  setTextSchema: (value: string) => void;
  schemaValidationErrors: string[];
}

const SchemaTextEditor: React.FC<SchemaTextEditorProps> = ({
                                                             textSchema,
                                                             setTextSchema,
                                                             schemaValidationErrors
                                                           }) => {
  const settings = loadSettings();
  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(true);

  const handleLoad = (editor: IAceEditor) => {
    editor.commands.addCommand({
      name: "openSearch",
      bindKey: { win: "Ctrl-F", mac: "Command-F" },
      exec: (editor) => editor.execCommand("find"),
    });

    editor.commands.addCommand({
      name: "openReplace",
      bindKey: { win: "Ctrl-H", mac: "Command-H" },
      exec: (editor) => editor.execCommand("replace"),
    });
  };

  return (
    <>
      <Row>
        <Col md={{ offset: 11, span: 1 }}>
          <ButtonGroup className={'float-end'}>
            <Button
              variant="primary"
              title={isWordWrapEnabled ? 'Unwrap' : 'Wrap'}
              onClick={() => setIsWordWrapEnabled((prev) => !prev)}
            >
              {isWordWrapEnabled && (<FluentTextWrap20Regular />)}
              {!isWordWrapEnabled && (<FluentTextWrapOff20Regular />)}
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
      <Row>
        <AceEditor
          mode={'json'}
          theme={settings['aceTheme'].value}
          onLoad={handleLoad}
          name={`schema-representation`}
          value={textSchema}
          onChange={setTextSchema}
          className={`border ${(schemaValidationErrors.length === 0 ? 'border-success' : 'border-danger')}`}
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
