import { Accordion, Button, Form, InputGroup } from 'react-bootstrap';
import React from 'react';
import SchemaFormBuilder, { initialSchema } from '../SchemaFormBuilder';
import { ObjectSchemaNode, SchemaNode } from '../../const/type';
import { LineiconsPlus, LineiconsTrash3 } from '../../const/icons';

export interface ObjectNodeProps {
  node: ObjectSchemaNode;
  onChange: (newNode: SchemaNode) => void;
  rootDefinitions?: Record<string, SchemaNode>;
}

const ObjectNode: React.FC<ObjectNodeProps> = ({
                                                 node,
                                                 onChange,
                                                 rootDefinitions
                                               }) => {
  return (
    <Accordion className="mb-3">
      <Accordion.Item eventKey="object-parameters">
        <Accordion.Header>Object Parameters</Accordion.Header>
        <Accordion.Body>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>
                Allow Additional Properties
              </InputGroup.Text>
              <Form.Select
                value={node.additionalProperties}
                onChange={(e) => onChange({
                  ...node,
                  additionalProperties: e.target.value as 'undefined' | 'true' | 'false'
                })}
              >
                <option value={'undefined'}>Undefined</option>
                <option value={'true'}>Yes</option>
                <option value={'false'}>No</option>
              </Form.Select>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>Minimum Properties</InputGroup.Text>
              <Form.Control
                type="number"
                value={node.minProperties || ''}
                min={0}
                onChange={(e) => onChange({ ...node, minProperties: Number(e.target.value) })}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>Maximum Properties</InputGroup.Text>
              <Form.Control
                type="number"
                value={node.maxProperties || ''}
                min={0}
                onChange={(e) => onChange({ ...node, maxProperties: Number(e.target.value) })}
              />
            </InputGroup>
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
                                <LineiconsTrash3 />
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
                  <LineiconsPlus />
                </Button>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <Accordion defaultActiveKey="0" className="mb-3">
            <Accordion.Item eventKey="patternProperties">
              <Accordion.Header>Pattern Properties</Accordion.Header>
              <Accordion.Body>
                {node.patternProperties?.map((prop, index) => (
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
                                  const newProperties = [...node.patternProperties!];
                                  newProperties[index] = { ...prop, name: e.target.value };
                                  onChange({ ...node, patternProperties: newProperties });
                                }}
                              />
                              <Button
                                variant="danger"
                                onClick={() => {
                                  const newProperties = node.patternProperties?.filter((_, i) => i !== index);
                                  onChange({ ...node, patternProperties: newProperties });
                                }}
                              >
                                <LineiconsTrash3 />
                              </Button>
                            </InputGroup>
                          </div>
                          <SchemaFormBuilder
                            node={prop.schema}
                            onChange={(newSchema) => {
                              const newProperties = [...node.patternProperties!];
                              newProperties[index].schema = newSchema;
                              onChange({ ...node, patternProperties: newProperties });
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
                    patternProperties: [...(node.patternProperties || []), {
                      name: '',
                      schema: initialSchema
                    }]
                  })}
                >
                  <LineiconsPlus />
                </Button>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  )
}

export default ObjectNode;
