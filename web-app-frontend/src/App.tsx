import React, { useState } from 'react';
import { Alert, Button, ButtonGroup, Col, Container, Row } from 'react-bootstrap';

import SchemaTextEditor from './components/SchemaTextEditor';
import SchemaFormBuilder, { initialSchema } from './components/SchemaFormBuilder';
import { convertToJsonSchema, parseJsonSchema } from './utils/converter';
import JsonInputForm from './components/JsonInputForm';
import { SchemaNode } from './const/type';
import { MoveLeftIcon, MoveRightIcon, PencilEdit01Icon } from 'hugeicons-react';

const App: React.FC = () => {
  const [rootSchema, setRootSchema] = useState<SchemaNode>(initialSchema);
  const [textSchema, setTextSchema] = useState<string>('');
  const [rootDefinitions, setRootDefinitions] = useState<Record<string, SchemaNode>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [schemaValidationErrors, setSchemaValidationErrors] = useState<string[]>([]);
  const [editorMode, setEditorMode] = useState<'builder' | 'ace'>('builder');
  const [showValidation, setShowValidation] = useState(true);

  const changeEditorMode = (mode: 'builder' | 'ace') => {
    if (mode === 'ace') {
      try {
        const json = convertToJsonSchema(rootSchema, true);
        setTextSchema(JSON.stringify(json, null, 4));
        setEditorMode(mode);
        setSchemaValidationErrors([])
      } catch (error) {
        console.error(`Invalid JSON Schema`, error);
        setSchemaValidationErrors([`${error}`])
      }
    } else {
      try {
        const parsed = JSON.parse(textSchema);
        const converted = parseJsonSchema(parsed);
        setRootDefinitions(converted.definitions || {})
        setRootSchema(converted);
        setEditorMode(mode)
        setSchemaValidationErrors([])
      } catch (error) {
        console.error(`Invalid JSON Schema`, error);
        setSchemaValidationErrors([`${error}`])
      }
    }
  }

  function jsonSchemaProvider() {
    try {
      if (editorMode === 'builder') {
        return convertToJsonSchema(rootSchema, true)
      }
      return textSchema ? JSON.parse(textSchema) : {}
    } catch (error) {
      console.error(`Invalid JSON Schema`, error);
      setSchemaValidationErrors([`${error}`])
    }
  }

  return (
    <Container className="my-4">
      <Row>
        <Col md={showValidation ? 6 : 12}>
          <Row className="mb-4">
            <Col md={showValidation ? 7 : 10}>
              <h3>JSON Schema Builder</h3>
            </Col>
            <Col md={showValidation ? 5 : 2}>
              <ButtonGroup className="mb-2">
                <Button variant={editorMode === 'builder' ? 'primary' : 'outline-primary'}
                        onClick={() => changeEditorMode('builder')}>
                  Builder
                </Button>
                <Button variant={editorMode === 'ace' ? 'primary' : 'outline-primary'}
                        onClick={() => changeEditorMode('ace')}>
                  <PencilEdit01Icon />
                </Button>
                <Button variant={showValidation ? 'secondary' : 'outline-secondary'}
                        onClick={() => {
                          setShowValidation(!showValidation)
                        }}>
                  {showValidation && (<MoveRightIcon />)}
                  {!showValidation && (<MoveLeftIcon />)}
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Col>
        <Col md={6} hidden={!showValidation}>
          <Row className="mb-4">
            <h3>Validation</h3>
          </Row>
        </Col>
      </Row>

      <Row>
        <Col md={showValidation ? 6 : 12}>
          {editorMode === 'builder' ? (
            <SchemaFormBuilder
              node={rootSchema}
              onChange={setRootSchema}
              rootDefinitions={rootDefinitions}
              isRoot={true} />
          ) : (
            <SchemaTextEditor
              textSchema={textSchema}
              setTextSchema={setTextSchema}
              schemaValidationErrors={schemaValidationErrors} />
          )
          }
          {schemaValidationErrors.length > 0 && (
            <div className="mt-3">
              {schemaValidationErrors.map((error, i) => (
                <Alert key={i} variant="danger" className="py-1 my-1">
                  {error}
                </Alert>
              ))}
            </div>
          )}
        </Col>
        <Col md={6} hidden={!showValidation}>
          <JsonInputForm jsonSchemaProvider={jsonSchemaProvider}
                         validationErrors={validationErrors}
                         setValidationErrors={setValidationErrors} />

          {validationErrors.length > 0 && (
            <div className="mt-3">
              {validationErrors.map((error, i) => (
                <Alert key={i} variant="danger" className="py-1 my-1">
                  {error}
                </Alert>
              ))}
            </div>
          )}
        </Col>
      </Row>

    </Container>
  );
};

export default App;
