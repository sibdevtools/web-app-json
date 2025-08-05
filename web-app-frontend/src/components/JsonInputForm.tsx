import { Alert, Button, ButtonGroup, Col, Row } from 'react-bootstrap';
import AceEditor from 'react-ace';
import React, { useState } from 'react';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { loadSettings } from '../settings/utils';
import '../const/ace.imports'
import {
  FluentMagicWand28Regular,
  FluentTextWrap20Regular,
  FluentTextWrapOff20Regular,
  LineiconsCheckSquare2
} from '../const/icons';
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
    <>
      <Row className={'px-2'}>
        <Col md={{ offset: 11, span: 1 }}>
          <ButtonGroup className={'float-end'}>
            {showMode === 'both' && (
              <Button
                variant="outline-success"
                title={'Validate'}
                onClick={validateAgainstSchema}
              >
                <LineiconsCheckSquare2 />
              </Button>
            )}
            <Button
              variant="outline-warning"
              title={'Beautify'}
              onClick={beautifyData}
            >
              <FluentMagicWand28Regular />
            </Button>
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
          onLoad={handleLoad}
          name={`json-input`}
          value={validationData}
          onChange={(value) => setValidationData(value)}
          className={`rounded border ${(validationErrors.length === 0 ? 'border-success' : 'border-danger')} mb-2`}
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
      </Row>
    </>
  );
}

export default JsonInputForm;
