import { Row } from 'react-bootstrap';
import AceEditor from 'react-ace';
import React from 'react';
import { loadSettings } from '../settings/utils';
import '../const/ace.imports'
import { IAceEditor } from 'react-ace/lib/types';


export interface JsonInputFormProps {
  json: string;
  setJson: (json: string) => void;
  isWordWrapEnabled: boolean;
}

const JsonInputForm: React.FC<JsonInputFormProps> = ({
                                                       json,
                                                       setJson,
                                                       isWordWrapEnabled,
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
      <Row>
        <AceEditor
          mode={'json'}
          theme={settings['aceTheme'].value}
          onLoad={handleLoad}
          name={`json-input`}
          value={json}
          onChange={(value) => setJson(value)}
          placeholder="Enter JSON to validate"
          style={{
            resize: 'vertical',
            overflow: 'auto',
            minHeight: '200px',
          }}
          fontSize={14}
          width="100%"
          height="100vh"
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

export default JsonInputForm;
