import React, { useState } from 'react';
import { Alert, Button, ButtonGroup, Col, Container, Row } from 'react-bootstrap';

import SchemaTextEditor from './components/SchemaTextEditor';
import SchemaFormBuilder, { initialSchema } from './components/SchemaFormBuilder';
import { convertToJsonSchema, parseJsonSchema } from './utils/converter';
import JsonInputForm from './components/JsonInputForm';
import { SchemaNode } from './const/type';
import { LineiconsBricks, LineiconsPenToSquare, LineiconsShiftLeft, LineiconsShiftRight } from './const/icons';

const App: React.FC = () => {
  const [rootSchema, setRootSchema] = useState<SchemaNode>(initialSchema);
  const [textSchema, setTextSchema] = useState<string>('');
  const [rootDefinitions, setRootDefinitions] = useState<Record<string, SchemaNode>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [schemaValidationErrors, setSchemaValidationErrors] = useState<string[]>([]);
  const [editorMode, setEditorMode] = useState<'builder' | 'ace'>('builder');
  const [showMode, setShowMode] = useState<'both' | 'builder' | 'json'>('both');

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
    <Container fluid className="my-4">
      <Row>
        <Col md={showMode === 'both' ? 6 : 12} hidden={showMode === 'json'}>
          <Row className="mb-4">
            <Col md={{ span: showMode === 'both' ? 7 : 9, offset: 1}}>
              <h3>JSON Schema Builder</h3>
            </Col>
            <Col md={showMode === 'both' ? 4 : 2}>
              <ButtonGroup className="mb-2">
                <Button variant={editorMode === 'builder' ? 'primary' : 'outline-primary'}
                        title={'Builder'}
                        onClick={() => changeEditorMode('builder')}>
                  <LineiconsBricks />
                </Button>
                <Button variant={editorMode === 'ace' ? 'primary' : 'outline-primary'}
                        title={'Text Editor'}
                        onClick={() => changeEditorMode('ace')}>
                  <LineiconsPenToSquare />
                </Button>
                <Button variant={showMode === 'both' ? 'secondary' : 'outline-secondary'}
                        onClick={() => {
                          if (showMode === 'both') setShowMode('builder');
                          else {
                            setShowMode('both');
                          }
                        }}>
                  {showMode === 'both' && (<LineiconsShiftRight />)}
                  {showMode === 'builder' && (<LineiconsShiftLeft />)}
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Col>
        <Col md={showMode === 'both' ? 6 : 12} hidden={showMode == 'builder'}>
          <Row className="mb-4">
            <Col md={{ span: 2, offset: 1 }}>
              <ButtonGroup className="mb-2">
                <Button variant={showMode === 'both' ? 'secondary' : 'outline-secondary'}
                        onClick={() => {
                          if (showMode === 'both') setShowMode('json');
                          else {
                            setShowMode('both');
                          }
                        }}>
                  {showMode === 'both' && (<LineiconsShiftLeft />)}
                  {showMode === 'json' && (<LineiconsShiftRight />)}
                </Button>
              </ButtonGroup>
            </Col>
            <Col md={{ offset: 1, span: 8 }}>
              <h3>JSON</h3>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row>
        <Col md={showMode === 'both' ? 6 : 12} hidden={showMode === 'json'}>
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
              schemaValidationErrors={schemaValidationErrors}
            />
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
        <Col md={showMode === 'both' ? 6 : 12} hidden={showMode === 'builder'}>
          <JsonInputForm jsonSchemaProvider={jsonSchemaProvider}
                         validationErrors={validationErrors}
                         setValidationErrors={setValidationErrors}
                         showMode={showMode}
          />

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
