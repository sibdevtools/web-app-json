import React from 'react';
import { Accordion, Button, Form, InputGroup } from 'react-bootstrap';
import { Add01Icon, Delete01Icon } from 'hugeicons-react';


const buildInFormats = [
  'date-time', 'time', 'date', 'duration',

  'email', 'idn-email',

  'hostname', 'idn-hostname',

  'ipv4', 'ipv6',

  'uuid', 'uri', 'uri-reference', 'iri',

  'uri-template',

  'json-pointer', 'relative-json-pointer',

  'regex'
]

function renameField(obj: Record<string, SchemaNode>, oldKey: string, newKey: string): Record<string, SchemaNode> {
  if (oldKey in obj) {
    const { [oldKey]: value, ...rest } = obj;
    return { ...rest, [newKey]: value };
  }
  return obj;
}

export interface SchemaNode {
  nodeType: 'simple' | 'oneOf' | 'anyOf' | 'allOf';
  type: 'undefined' | 'string' | 'boolean' | 'number' | 'integer' | 'object' | 'array' | 'null';
  specification: 'none' | 'enum' | 'const' | 'reference';
  reference?: string;
  definitions?: Record<string, SchemaNode>;
  nullable: boolean;
  title: string;
  description: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
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
  const?: string;
  enum?: Array<string>;
  allOf?: SchemaNode[];
  anyOf?: SchemaNode[];
  oneOf?: SchemaNode[];
}

export const initialSchema: SchemaNode = {
  nodeType: 'simple',
  type: 'string',
  specification: 'none',
  nullable: false,
  title: '',
  description: '',
  additionalProperties: true,
};


const SchemaFormBuilder: React.FC<{
  node: SchemaNode;
  onChange: (newNode: SchemaNode) => void;
  rootDefinitions?: Record<string, SchemaNode>;
  isRoot?: boolean;
}> = ({ node, onChange, rootDefinitions, isRoot = false }) => {
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
          <InputGroup.Text>Node Type</InputGroup.Text>
          <Form.Select
            value={node.nodeType}
            onChange={(e) => {
              const newNode = { ...node, nodeType: e.target.value as 'simple' | 'oneOf' | 'anyOf' | 'allOf' };
              if (newNode.nodeType !== 'simple') {
                newNode[newNode.nodeType] = node.nodeType === 'simple' ? [initialSchema] : (node[node.nodeType] || [initialSchema]);
              } else {
                delete newNode.oneOf;
                delete newNode.anyOf;
                delete newNode.allOf;
              }
              onChange(newNode);
            }}
          >
            <option value="simple">Simple</option>
            <option value="oneOf">One Of</option>
            <option value="anyOf">Any Of</option>
            <option value="allOf">All Of</option>
          </Form.Select>
        </InputGroup>
      </Form.Group>


      {node.nodeType === 'simple' && (
        <>
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
                {['undefined', 'string', 'boolean', 'number', 'integer', 'object', 'array', 'null'].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Form.Select>
              <InputGroup.Text>
                <Form.Check
                  type="checkbox"
                  label="Nullable"
                  checked={node.nullable}
                  onChange={(e) => onChange({ ...node, nullable: e.target.checked })}
                  disabled={node.type === 'null' || node.type === 'undefined'}
                />
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>
                Specification
              </InputGroup.Text>
              <Form.Select
                value={node.specification}
                onChange={(e) => onChange({ ...node, specification: e.target.value as SchemaNode['specification'] })}
              >
                {['none', 'const', 'enum', 'reference'].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Form.Select>
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
              <Form.Group className="mb-3">
                <InputGroup>
                  <InputGroup.Text>Format</InputGroup.Text>
                  <Form.Control
                    value={node.format || ''}
                    list="format-suggestions"
                    onChange={(e) => onChange({ ...node, format: e.target.value })}
                  />
                  <datalist id="format-suggestions">
                    {
                      buildInFormats
                        .map(it => <option key={it} value={it} />)
                    }
                  </datalist>
                </InputGroup>
              </Form.Group>
            </>
          )}

          {(node.type === 'number' || node.type === 'integer') && (
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
                                  <Button
                                    variant="danger"
                                    onClick={() => {
                                      const newProperties = node.properties?.filter((_, i) => i !== index);
                                      onChange({ ...node, properties: newProperties });
                                    }}
                                  >
                                    <Delete01Icon />
                                  </Button>
                                </InputGroup>
                              </div>
                              <SchemaFormBuilder
                                node={prop.schema}
                                onChange={(newSchema) => {
                                  const newProperties = [...node.properties!];
                                  newProperties[index].schema = newSchema;
                                  onChange({ ...node, properties: newProperties });
                                }}
                                rootDefinitions={rootDefinitions}
                              />
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    ))}
                    <Button
                      variant="outline-success"
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
                      <Add01Icon />
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
                  <SchemaFormBuilder
                    node={node.items || initialSchema}
                    onChange={(items) => onChange({ ...node, items })}
                    rootDefinitions={rootDefinitions}
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

          {node.specification === 'const' && (
            <>
              <Form.Group className="mb-3">
                <InputGroup>
                  <InputGroup.Text>Const</InputGroup.Text>
                  <Form.Control
                    value={node.const || ''}
                    onChange={(e) => onChange({ ...node, const: e.target.value })}
                  />
                </InputGroup>
              </Form.Group>
            </>
          )}

          {node.specification === 'enum' && node.enum?.map((it, index) => (
            <>
              <Form.Group className="mb-3">
                <InputGroup>
                  <InputGroup.Text>Enum Item</InputGroup.Text>
                  <Form.Control
                    value={it || ''}
                    onChange={(e) => {
                      const newEnum = [...(node.enum || [])]
                      newEnum[index] = e.target.value
                      onChange({ ...node, enum: newEnum })
                    }}
                  />
                  <Button
                    variant="outline-danger"
                    onClick={() => {
                      const newEnum = node.enum?.filter((_, i) => i !== index);
                      onChange({ ...node, enum: newEnum });
                    }}
                  >
                    -
                  </Button>
                </InputGroup>
              </Form.Group>
            </>
          ))}
          {node.specification === 'enum' && (
            <>
              <Button
                variant="outline-success"
                onClick={() => {
                  const newEnum = [...(node.enum || [])]
                  newEnum.push('')
                  onChange({ ...node, enum: newEnum });
                }}
              >
                +
              </Button>
            </>
          )}

          {node.specification === 'reference' && (
            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text>Reference</InputGroup.Text>
                <Form.Control
                  value={node.reference || ''}
                  list={'reference-suggestions'}
                  onChange={(e) => onChange({ ...node, reference: e.target.value })}
                />
                <datalist id="reference-suggestions">
                  {
                    Object.keys(rootDefinitions || {})
                      .map(it => `#/$defs/${it}`)
                      .map(it => <option key={it} value={it} />)
                  }
                </datalist>
              </InputGroup>
            </Form.Group>
          )}
        </>
      )}

      {node.nodeType !== 'simple' && (
        <Accordion defaultActiveKey="0" className="mb-3">
          <Accordion.Item eventKey={node.nodeType}>
            <Accordion.Header>{node.nodeType}</Accordion.Header>
            <Accordion.Body>
              {node[node.nodeType]?.map((schema, index) => (
                <Accordion key={index} className="mb-3">
                  <Accordion.Item eventKey={String(index)}>
                    <Accordion.Header>Schema {index + 1}</Accordion.Header>
                    <Accordion.Body>
                      <SchemaFormBuilder
                        node={schema}
                        onChange={(newSchema) => {
                          if (node.nodeType === 'simple') {
                            return
                          }
                          const newSchemas = [...node[node.nodeType]!];
                          newSchemas[index] = newSchema;
                          onChange({ ...node, [node.nodeType]: newSchemas });
                        }}
                        rootDefinitions={rootDefinitions}
                      />
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (node.nodeType === 'simple') {
                            return
                          }
                          const newSchemas = node[node.nodeType]?.filter((_, i) => i !== index);
                          onChange({ ...node, [node.nodeType]: newSchemas });
                        }}
                      >
                        <Delete01Icon />
                      </Button>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              ))}
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => {
                  if (node.nodeType === 'simple') {
                    return
                  }
                  const newSchemas = [...(node[node.nodeType] || []), initialSchema];
                  onChange({ ...node, [node.nodeType]: newSchemas });
                }}
              >
                <Add01Icon />
              </Button>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}

      {isRoot && (
        <Accordion className="mt-3">
          <Accordion.Item eventKey="definitions">
            <Accordion.Header>Definitions</Accordion.Header>
            <Accordion.Body>
              <Accordion className="mb-3">
                {Object.entries(node.definitions || {}).map(([name, defNode], index) => (
                  <Accordion.Item eventKey={`definition-${index}`}>
                    <Accordion.Header>{name}</Accordion.Header>
                    <Accordion.Body>
                      <div key={`definition-${index}`} className="border p-3 mb-3">
                        <Form.Group className="mb-3">
                          <InputGroup>
                            <InputGroup.Text>Name</InputGroup.Text>
                            <Form.Control
                              value={name}
                              onChange={(e) => {
                                const newDefinitions = renameField(node.definitions || {}, name, e.target.value)
                                onChange({ ...node, definitions: newDefinitions });
                              }}
                            />
                            <Button
                              variant="danger"
                              onClick={() => {
                                const newDefinitions = { ...node.definitions };
                                delete newDefinitions[name];
                                onChange({ ...node, definitions: newDefinitions });
                              }}
                            >
                              <Delete01Icon />
                            </Button>
                          </InputGroup>
                        </Form.Group>
                        <Accordion className="mt-3">
                          <Accordion.Item eventKey={`definition-${index}-internals`}>
                            <Accordion.Header>Definition</Accordion.Header>
                            <Accordion.Body>
                              <SchemaFormBuilder
                                node={defNode}
                                onChange={(newDefNode) => {
                                  const newDefinitions = { ...node.definitions };
                                  newDefinitions[name] = newDefNode;
                                  onChange({ ...node, definitions: newDefinitions });
                                }}
                                rootDefinitions={rootDefinitions}
                              />
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => {
                  const newName = `definition${Object.keys(node.definitions || {}).length + 1}`;
                  const newDefinitions = { ...node.definitions || {}, [newName]: initialSchema };
                  onChange({ ...node, definitions: newDefinitions });
                }}
              >
                <Add01Icon />
              </Button>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}
    </div>
  );
};

export default SchemaFormBuilder;
