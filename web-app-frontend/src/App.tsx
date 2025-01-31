import React, { useState } from 'react';
import { Accordion, Alert, Button, ButtonGroup, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import Ajv from 'ajv';
import AceEditor from 'react-ace';
import { loadSettings } from './settings/utils';
import { CheckmarkSquare01Icon, TextWrapIcon } from 'hugeicons-react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'hugeicons-react';
import 'ace-builds/src-min-noconflict/mode-json'
import 'ace-builds/src-min-noconflict/snippets/json'

const ajv = new Ajv({ allErrors: true });

interface SchemaNode {
  type: 'string' | 'boolean' | 'number' | 'object' | 'array' | 'null';
  nullable: boolean;
  title: string;
  description: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  properties?: Array<{
    name: string;
    required: boolean;
    schema: SchemaNode;
  }>;
  items?: SchemaNode;
  minItems?: number;
  maxItems?: number;
  additionalProperties?: boolean;
}

const initialSchema: SchemaNode = {
  type: 'string',
  nullable: false,
  title: '',
  description: '',
  additionalProperties: true,
};

function convertToJsonSchema(node: SchemaNode): any {
  const baseType = node.type === 'null' ? 'null' : node.type;
  const type = node.nullable ? ['null', baseType] : baseType;

  const schema: any = {
    type,
    title: node.title || undefined,
    description: node.description || undefined,
  };

  switch (node.type) {
    case 'string':
      if (node.minLength !== undefined) schema.minLength = node.minLength;
      if (node.maxLength !== undefined) schema.maxLength = node.maxLength;
      if (node.pattern) schema.pattern = node.pattern;
      break;
    case 'number':
      if (node.minimum !== undefined) schema.minimum = node.minimum;
      if (node.maximum !== undefined) schema.maximum = node.maximum;
      break;
    case 'object':
      schema.additionalProperties = node.additionalProperties;
      if (node.properties) {
        schema.properties = node.properties.reduce((acc, prop) => {
          acc[prop.name] = convertToJsonSchema(prop.schema);
          return acc;
        }, {} as Record<string, any>);

        const required = node.properties
          .filter(prop => prop.required)
          .map(prop => prop.name);
        if (required.length > 0) {
          schema.required = required;
        }
      }
      break;
    case 'array':
      if (node.items) schema.items = convertToJsonSchema(node.items);
      if (node.minItems !== undefined) schema.minItems = node.minItems;
      if (node.maxItems !== undefined) schema.maxItems = node.maxItems;
      break;
  }

  return schema;
}

const SchemaForm: React.FC<{
  node: SchemaNode;
  onChange: (newNode: SchemaNode) => void;
}> = ({ node, onChange }) => {
  const handleNumberChange = (field: 'minimum' | 'maximum', value: string) => {
    const numericValue = value === '' ? undefined : Number(value);
    const updates: Partial<SchemaNode> = { [field]: numericValue };

    if (field === 'minimum' && node.maximum !== undefined && numericValue !== undefined) {
      updates.maximum = Math.max(node.maximum, numericValue);
    }
    if (field === 'maximum' && node.minimum !== undefined && numericValue !== undefined) {
      updates.minimum = Math.min(node.minimum, numericValue);
    }

    onChange({ ...node, ...updates });
  };

  return (
    <div className="border p-3 mb-3">
      <Form.Group className="mb-3">
        <InputGroup>
          <InputGroup.Text>Title</InputGroup.Text>
          <Form.Control
            value={node.title}
            onChange={(e) => onChange({ ...node, title: e.target.value.slice(0, 64) })}
            maxLength={64}
          />
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-3">
        <InputGroup>
          <InputGroup.Text>Description</InputGroup.Text>
          <Form.Control
            value={node.description}
            onChange={(e) => onChange({ ...node, description: e.target.value.slice(0, 256) })}
            maxLength={256}
          />
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-3">
        <InputGroup>
          <InputGroup.Text>
            Type
          </InputGroup.Text>
          <Form.Select
            value={node.type}
            onChange={(e) => onChange({ ...node, type: e.target.value as SchemaNode['type'] })}
          >
            {['string', 'boolean', 'number', 'object', 'array', 'null'].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Form.Select>
          <InputGroup.Text>

            <Form.Check
              type="checkbox"
              label="Nullable"
              checked={node.nullable}
              onChange={(e) => onChange({ ...node, nullable: e.target.checked })}
              disabled={node.type === 'null'}
            />
          </InputGroup.Text>
        </InputGroup>
      </Form.Group>

      {node.type === 'string' && (
        <>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>Minimum Length</InputGroup.Text>
              <Form.Control
                type="number"
                value={node.minLength || ''}
                min={0}
                onChange={(e) => onChange({ ...node, minLength: Number(e.target.value) })}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>Maximum Length</InputGroup.Text>
              <Form.Control
                type="number"
                value={node.maxLength || ''}
                min={0}
                onChange={(e) => onChange({ ...node, maxLength: Number(e.target.value) })}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>Pattern</InputGroup.Text>
              <Form.Control
                value={node.pattern || ''}
                onChange={(e) => onChange({ ...node, pattern: e.target.value })}
              />
            </InputGroup>
          </Form.Group>
        </>
      )}

      {node.type === 'number' && (
        <>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>Minimum Value</InputGroup.Text>
              <Form.Control
                type="number"
                value={node.minimum ?? ''}
                onChange={(e) => handleNumberChange('minimum', e.target.value)}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>Maximum Value</InputGroup.Text>
              <Form.Control
                type="number"
                value={node.maximum ?? ''}
                onChange={(e) => handleNumberChange('maximum', e.target.value)}
              />
            </InputGroup>
          </Form.Group>
        </>
      )}
      {node.type === 'object' && (
        <>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Allow Additional Properties"
              checked={node.additionalProperties}
              onChange={(e) => onChange({ ...node, additionalProperties: e.target.checked })}
            />
          </Form.Group>

          <Accordion defaultActiveKey="0" className="mb-3">
            <Accordion.Item eventKey="properties">
              <Accordion.Header>Properties</Accordion.Header>
              <Accordion.Body>
                {node.properties?.map((prop, index) => (
                  <Accordion key={index} className="mb-3">
                    <Accordion.Item eventKey={String(index)}>
                      <Accordion.Header>
                        {prop.name || 'Unnamed Property'} ({prop.schema.type})
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className="border p-3 mb-3">
                          <div className="d-flex gap-3 mb-3">
                            <InputGroup className="flex-grow-1">
                              <InputGroup.Text>Name</InputGroup.Text>
                              <Form.Control
                                value={prop.name}
                                onChange={(e) => {
                                  const newProperties = [...node.properties!];
                                  newProperties[index] = { ...prop, name: e.target.value };
                                  onChange({ ...node, properties: newProperties });
                                }}
                              />
                              <InputGroup.Text>
                                <Form.Check
                                  type="checkbox"
                                  label="Required"
                                  checked={prop.required}
                                  onChange={(e) => {
                                    const newProperties = [...node.properties!];
                                    newProperties[index] = { ...prop, required: e.target.checked };
                                    onChange({ ...node, properties: newProperties });
                                  }}
                                />
                              </InputGroup.Text>
                            </InputGroup>
                          </div>
                          <SchemaForm
                            node={prop.schema}
                            onChange={(newSchema) => {
                              const newProperties = [...node.properties!];
                              newProperties[index].schema = newSchema;
                              onChange({ ...node, properties: newProperties });
                            }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              const newProperties = node.properties?.filter((_, i) => i !== index);
                              onChange({ ...node, properties: newProperties });
                            }}
                          >
                            Remove Property
                          </Button>
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onChange({
                    ...node,
                    properties: [...(node.properties || []), {
                      name: '',
                      required: false,
                      schema: initialSchema
                    }]
                  })}
                >
                  Add Property
                </Button>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </>
      )}

      {node.type === 'array' && (
        <Accordion defaultActiveKey="0" className="mb-3">
          <Accordion.Item eventKey="items">
            <Accordion.Header>Items</Accordion.Header>
            <Accordion.Body>
              <SchemaForm
                node={node.items || initialSchema}
                onChange={(items) => onChange({ ...node, items })}
              />
              <Form.Group className="mb-3">
                <InputGroup>
                  <InputGroup.Text>Minimum Items</InputGroup.Text>
                  <Form.Control
                    type="number"
                    value={node.minItems || ''}
                    onChange={(e) => onChange({ ...node, minItems: Number(e.target.value) })}
                  />
                </InputGroup>
              </Form.Group>
              <Form.Group className="mb-3">
                <InputGroup>
                  <InputGroup.Text>Maximum Items</InputGroup.Text>
                  <Form.Control
                    type="number"
                    value={node.maxItems || ''}
                    onChange={(e) => onChange({ ...node, maxItems: Number(e.target.value) })}
                  />
                </InputGroup>
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [rootSchema, setRootSchema] = useState<SchemaNode>(initialSchema);
  const [textSchema, setTextSchema] = useState<string>('');
  const [validationData, setValidationData] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const settings = loadSettings();
  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(true);
  const [isWordWrapInputEnabled, setIsWordWrapInputEnabled] = useState(true);
  const [editorMode, setEditorMode] = useState<'builder' | 'ace'>('builder');

  const validateAgainstSchema = () => {
    try {
      const dataToValidate = JSON.parse(validationData);
      const jsonSchema = convertToJsonSchema(rootSchema);
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
          if(e.dataPath) {
            return `'${e.dataPath}': ${e.message}`;
          }
          return `${e.message}`;
        }));
      }

      setValidationErrors(errors);
      if (errors.length === 0) {
        console.log('Validation successful!');
      } else {
        console.error('Validation errors:', errors);
      }
    } catch (e) {
      setValidationErrors([`Invalid JSON: ${(e as Error).message}`]);
    }
  };

  const changeEditorMode = (mode: 'builder' | 'ace') => {
    if(mode === 'ace') {
      setTextSchema(
        JSON.stringify(convertToJsonSchema(rootSchema), null, 4)
      )
    }
    setEditorMode(mode)
  }

  return (
    <Container className="my-4">
      <Row>
        <Col md={6}>
          <h3 className="mb-4">JSON Schema Builder</h3>
          <ButtonGroup className="mb-2">
            <Button variant={editorMode === 'builder' ? 'primary' : 'secondary'}
                    onClick={() => changeEditorMode('builder')}>
              Builder
            </Button>
            <Button variant={editorMode === 'ace' ? 'primary' : 'secondary'} onClick={() => changeEditorMode('ace')}>
              Text Editor
            </Button>
          </ButtonGroup>
          {editorMode === 'builder' ? (
            <SchemaForm node={rootSchema} onChange={setRootSchema} />
          ) : (
            <div>
              <ButtonGroup className={'float-end'}>
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
                name={`schema-representation`}
                value={textSchema}
                onChange={setTextSchema}
                className={'rounded'}
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
            </div>
          )
          }
        </Col>
        <Col md={6}>
          <div className="mb-4">
            <h3>Validation</h3>
            <div>
              <ButtonGroup className={'float-end'}>
                <Button
                  variant="outline-primary"
                  title={'Validate'}
                  onClick={validateAgainstSchema}
                >
                  <CheckmarkSquare01Icon />
                </Button>
                <Button
                  variant="primary"
                  active={isWordWrapInputEnabled}
                  title={isWordWrapInputEnabled ? 'Unwrap' : 'Wrap'}
                  onClick={() => setIsWordWrapInputEnabled((prev) => !prev)}
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
                wrapEnabled={isWordWrapInputEnabled}
                setOptions={{
                  showLineNumbers: true,
                  wrap: isWordWrapInputEnabled,
                  useWorker: false,
                }}
                editorProps={{ $blockScrolling: true }}
              />
            </div>

            {validationErrors.length > 0 && (
              <div className="mt-3">
                {validationErrors.map((error, i) => (
                  <Alert key={i} variant="danger" className="py-1 my-1">
                    {error}
                  </Alert>
                ))}
              </div>
            )}
          </div>
        </Col>
      </Row>

    </Container>
  );
};

export default App;
