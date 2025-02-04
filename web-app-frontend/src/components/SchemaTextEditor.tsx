import { Button, ButtonGroup, Col, Row } from 'react-bootstrap';
import AceEditor from 'react-ace';
import React, { useState } from 'react';
import { loadSettings } from '../settings/utils';

import '../const/ace.imports'
import { FluentTextWrap20Regular, FluentTextWrapOff20Regular } from '../const/icons';

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

  return (
    <>
      <Row className={'px-2'}>
        <Col md={{ offset: 11, span: 1 }}>
          <ButtonGroup>
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
      <Row className={'px-2'}>
        <AceEditor
          mode={'json'}
          theme={settings['aceTheme'].value}
          name={`schema-representation`}
          value={textSchema}
          onChange={setTextSchema}
          className={`rounded border ${(schemaValidationErrors.length === 0 ? 'border-success' : 'border-danger')}`}
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
      </Row>
    </>
  );
}

export default SchemaTextEditor;
