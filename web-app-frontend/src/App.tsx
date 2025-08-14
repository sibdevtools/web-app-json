import React, { useState } from 'react';
import { Button, Col, Container, Nav, Row } from 'react-bootstrap';

import SchemaTextEditor from './components/SchemaTextEditor';
import SchemaFormBuilder, { initialSchema } from './components/SchemaFormBuilder';
import { convertToJsonSchema, parseJsonSchema } from './utils/converter';
import JsonInputForm from './components/JsonInputForm';
import { SchemaNode } from './const/type';
import {
  FluentMagicWand16Regular,
  FluentTextWrap20Regular,
  FluentTextWrapOff20Regular,
  LineiconsCheckSquare2
} from './const/icons';
import Ajv2019, { ValidateFunction } from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const draft06MetaSchema = require('ajv/lib/refs/json-schema-draft-06.json');

const beautify = (
  text: string,
  setText: (text: string) => void,
  setValidationErrors: (errors: string[]) => void
) => {
  try {
    const dataToValidate = JSON.parse(text);
    setText(JSON.stringify(dataToValidate, null, 4));
    setValidationErrors([]);
  } catch (e) {
    setValidationErrors([`Invalid JSON: ${(e as Error).message}`]);
  }
};

const getValidateFn = (schema: any): ValidateFunction => {
  if (schema.$schema === 'https://json-schema.org/draft/2019-09/schema') {
    const ajv2019 = new Ajv2019({ allErrors: true })
    addFormats(ajv2019);
    return ajv2019.compile(schema);
  } else if (schema.$schema === 'https://json-schema.org/draft/2020-12/schema') {
    const ajv2020 = new Ajv2020({ allErrors: true })
    addFormats(ajv2020);
    return ajv2020.compile(schema);
  } else {
    const ajv = new Ajv({ allErrors: true });
    ajv.addMetaSchema(draft06MetaSchema);
    addFormats(ajv);
    return ajv.compile(schema);
  }
}

export const App: React.FC = () => {
  const [rootSchema, setRootSchema] = useState<SchemaNode>(initialSchema);
  const [textSchema, setTextSchema] = useState<string>(JSON.stringify(convertToJsonSchema(initialSchema, true), null, 4));
  const [schemaValidationErrors, setSchemaValidationErrors] = useState<string[]>([]);
  const [showMode, setShowMode] = useState<'schema' | 'builder' | 'json'>('schema');
  const [isSchemaWordWrapEnabled, setIsSchemaWordWrapEnabled] = useState(true);
  const [isJsonWordWrapEnabled, setIsJsonWordWrapEnabled] = useState(true);
  const [json, setJson] = useState<string>('');
  const [jsonValidationErrors, setJsonValidationErrors] = useState<string[]>([]);

  const validateAgainstSchema = () => {
    setJsonValidationErrors([]);
    try {
      const dataToValidate = JSON.parse(json);
      const jsonSchema = JSON.parse(textSchema);
      const validate = getValidateFn(jsonSchema);
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

      setJsonValidationErrors(errors);
    } catch (e) {
      setJsonValidationErrors([`Invalid JSON: ${(e as Error).message}`]);
    }
  };

  const handleSchemaBuilderModeChange = (mode: 'schema' | 'builder') => {
    if (mode === 'schema') {
      try {
        const json = convertToJsonSchema(rootSchema, true);
        setTextSchema(JSON.stringify(json, null, 4));
        setSchemaValidationErrors([])
      } catch (error) {
        console.error(`Invalid JSON Schema`, error);
        setSchemaValidationErrors([`${error}`])
      }
    } else {
      try {
        const parsed = JSON.parse(textSchema);
        const converted = parseJsonSchema(parsed);
        setRootSchema(converted);
        setSchemaValidationErrors([])
      } catch (error) {
        console.error(`Invalid JSON Schema`, error);
        setSchemaValidationErrors([`${error}`])
      }
    }
    setShowMode(mode)
  }

  return (
    <Container fluid={true}>
      <Row>
        <Nav className={'mt-2'} justify variant="tabs" defaultActiveKey="schema" activeKey={showMode}>
          <Nav.Item>
            <Nav.Link eventKey="schema" onClick={() => handleSchemaBuilderModeChange('schema')}>Schema</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="builder" onClick={() => handleSchemaBuilderModeChange('builder')}>Builder</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="json" onClick={() => setShowMode('json')}>JSON</Nav.Link>
          </Nav.Item>
          {showMode === 'schema' && (
            <Nav.Item>
              <div className="d-grid gap-2 d-flex justify-content-end">
                <Button
                  size={'sm'}
                  variant={'outline-primary'}
                  title="Beautify"
                  onClick={() => beautify(textSchema, setTextSchema, setSchemaValidationErrors)}>
                  <FluentMagicWand16Regular />
                </Button>
                <Button
                  size={'sm'}
                  variant={'primary'}
                  className={`${(isSchemaWordWrapEnabled ? 'active' : '')}`}
                  title={isSchemaWordWrapEnabled ? 'Unwrap' : 'Wrap'}
                  onClick={() => setIsSchemaWordWrapEnabled((prev) => !prev)}
                >
                  {isSchemaWordWrapEnabled && (<FluentTextWrap20Regular />)}
                  {!isSchemaWordWrapEnabled && (<FluentTextWrapOff20Regular />)}
                </Button>
              </div>
            </Nav.Item>
          )}
          {showMode === 'json' && (
            <Nav.Item>
              <div className="d-grid gap-2 d-flex justify-content-end">
                <Button
                  size={'sm'}
                  variant={'success'}
                  title="Validate"
                  onClick={() => validateAgainstSchema()}>
                  <LineiconsCheckSquare2 />
                </Button>
                <Button
                  size={'sm'}
                  variant={'outline-primary'}
                  title="Beautify"
                  onClick={() => beautify(json, setJson, setJsonValidationErrors)}>
                  <FluentMagicWand16Regular />
                </Button>
                <Button
                  size={'sm'}
                  variant={'primary'}
                  className={`${(isJsonWordWrapEnabled ? 'active' : '')}`}
                  title={isJsonWordWrapEnabled ? 'Unwrap' : 'Wrap'}
                  onClick={() => setIsJsonWordWrapEnabled((prev) => !prev)}
                >
                  {isJsonWordWrapEnabled && (<FluentTextWrap20Regular />)}
                  {!isJsonWordWrapEnabled && (<FluentTextWrapOff20Regular />)}
                </Button>
              </div>
            </Nav.Item>
          )}
        </Nav>
      </Row>
      <Row>
        <Col xs={12} hidden={showMode !== 'schema'}>
          <SchemaTextEditor
            textSchema={textSchema}
            setTextSchema={setTextSchema}
            isWordWrapEnabled={isSchemaWordWrapEnabled}
            validationErrors={schemaValidationErrors}
            setValidationErrors={setSchemaValidationErrors}
          />
        </Col>
        <Col xs={12} hidden={showMode !== 'builder'} className={'mt-2 px-4'}>
          <SchemaFormBuilder
            node={rootSchema}
            onChange={setRootSchema}
            rootDefinitions={(rootSchema.definitions ?? []).map(it => it.id)}
            isRoot={true} />
        </Col>
        <Col xs={12} hidden={showMode !== 'json'}>
          <JsonInputForm json={json}
                         setJson={setJson}
                         isWordWrapEnabled={isJsonWordWrapEnabled}
                         validationErrors={jsonValidationErrors}
                         setValidationErrors={setJsonValidationErrors}
          />
        </Col>
      </Row>
    </Container>
  );
};
