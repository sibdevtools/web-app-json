import { Button, ButtonGroup, Col, Row } from 'react-bootstrap';
import AceEditor from 'react-ace';
import React, { useState } from 'react';
import Ajv from 'ajv';
import { loadSettings } from '../settings/utils';
import '../const/ace.imports'
import {
  FluentMagicWand28Regular,
  FluentTextWrap20Regular,
  FluentTextWrapOff20Regular,
  LineiconsCheckSquare2
} from '../const/icons';

const ajv = new Ajv({ allErrors: true });

export interface JsonInputFormProps {
  jsonSchemaProvider: () => any;
  validationErrors: string[];
  setValidationErrors: (value: string[]) => void;
  showMode: 'both' | 'builder' | 'json';
}

const JsonInputForm: React.FC<JsonInputFormProps> = ({
                                                       jsonSchemaProvider,
                                                       validationErrors,
                                                       setValidationErrors,
                                                       showMode
                                                     }) => {
  const [validationData, setValidationData] = useState('');

  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(true);
  const settings = loadSettings();

  const validateAgainstSchema = () => {
    try {
      const dataToValidate = JSON.parse(validationData);
      const jsonSchema = jsonSchemaProvider();
      const validate = ajv.compile(jsonSchema);
      const valid = validate(dataToValidate);

      const errors: string[] = [];

      if (!valid && validate.errors) {
        errors.push(...validate.errors.map(e => {
          if (e.keyword === 'additionalProperties' && 'additionalProperty' in e.params) {
            const propName = e.params.additionalProperty;
            return `${e.message}: '${propName}'`;
          }
          console.log(JSON.stringify(e));
          if (e.dataPath) {
            return `'${e.dataPath}': ${e.message}`;
          }
          return `${e.message}`;
        }));
      }

      setValidationErrors(errors);
      if (errors.length > 0) {
        console.error('Validation errors:', errors);
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
          name={`json-input`}
          value={validationData}
          onChange={(value) => setValidationData(value)}
          className={`rounded border ${(validationErrors.length === 0 ? 'border-success' : 'border-danger')}`}
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
      </Row>
    </>
  );
}

export default JsonInputForm;
