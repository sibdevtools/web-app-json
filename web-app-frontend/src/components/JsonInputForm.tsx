import { Button, ButtonGroup, Container } from 'react-bootstrap';
import { AiBeautifyIcon, CheckmarkSquare01Icon, TextWrapIcon } from 'hugeicons-react';
import AceEditor from 'react-ace';
import React, { useState } from 'react';
import Ajv from 'ajv';
import { loadSettings } from '../settings/utils';
import '../const/ace.imports'

const ajv = new Ajv({ allErrors: true });

export interface JsonInputFormProps {
  jsonSchemaProvider: () => any;
  validationErrors: string[];
  setValidationErrors: (value: string[]) => void;
}

const JsonInputForm: React.FC<JsonInputFormProps> = ({
                                                       jsonSchemaProvider,
                                                       validationErrors,
                                                       setValidationErrors
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
    <Container>
      <ButtonGroup className={'float-end'}>
        <Button
          variant="outline-success"
          title={'Validate'}
          onClick={validateAgainstSchema}
        >
          <CheckmarkSquare01Icon />
        </Button>
        <Button
          variant="outline-secondary"
          title={'Beautify'}
          onClick={beautifyData}
        >
          <AiBeautifyIcon />
        </Button>
        <Button
          variant="primary"
          active={isWordWrapEnabled}
          title={isWordWrapEnabled ? 'Unwrap' : 'Wrap'}
          onClick={() => setIsWordWrapEnabled((prev) => !prev)}
        >
          <TextWrapIcon />
        </Button>
      </ButtonGroup>
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
    </Container>
  );
}

export default JsonInputForm;
