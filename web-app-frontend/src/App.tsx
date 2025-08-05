import React, { useState } from 'react';
import { Col, Container, Nav, Row } from 'react-bootstrap';

import SchemaTextEditor from './components/SchemaTextEditor';
import SchemaFormBuilder, { initialSchema } from './components/SchemaFormBuilder';
import { convertToJsonSchema, parseJsonSchema } from './utils/converter';
import JsonInputForm from './components/JsonInputForm';
import { SchemaNode } from './const/type';

const App: React.FC = () => {
  const [rootSchema, setRootSchema] = useState<SchemaNode>(initialSchema);
  const [textSchema, setTextSchema] = useState<string>(JSON.stringify(convertToJsonSchema(initialSchema, true), null, 4));
  const [schemaValidationErrors, setSchemaValidationErrors] = useState<string[]>([]);
  const [showMode, setShowMode] = useState<'schema' | 'builder' | 'json'>('schema');

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

  function jsonSchemaProvider() {
    try {
      if (showMode === 'builder') {
        return convertToJsonSchema(rootSchema, true)
      }
      return textSchema ? JSON.parse(textSchema) : {}
    } catch (error) {
      console.error(`Invalid JSON Schema`, error);
      setSchemaValidationErrors([`${error}`])
    }
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
        </Nav>
      </Row>
      <Row>
        <Col xs={12} hidden={showMode !== 'schema'}>
          <SchemaTextEditor
            textSchema={textSchema}
            setTextSchema={setTextSchema}
            schemaValidationErrors={schemaValidationErrors}
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
          <JsonInputForm jsonSchemaProvider={jsonSchemaProvider} />
        </Col>
      </Row>
    </Container>
  );
};

export default App;
