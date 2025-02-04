import { Button, ButtonGroup, Container } from 'react-bootstrap';
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
    <Container>
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
    </Container>
  );
}

export default SchemaTextEditor;
