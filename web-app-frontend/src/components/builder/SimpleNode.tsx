import { Accordion, Form, InputGroup } from 'react-bootstrap';
import React from 'react';
import { ArraySchemaNode, NumberSchemaNode, ObjectSchemaNode, SchemaNode, StringSchemaNode } from '../../const/type';
import StringNode from './StringNode';
import NumberNode from './NumberNode';
import ObjectNode from './ObjectNode';
import ArrayNode from './ArrayNode';
import ConstNode from './ConstNode';
import EnumNode from './EnumNode';
import ReferenceNode from './ReferenceNode';
import Examples from './Examples';


export interface SimpleNodeProps {
  node: SchemaNode;
  onChange: (newNode: SchemaNode) => void;
  rootDefinitions?: Record<string, SchemaNode>;
}

const SimpleNode: React.FC<SimpleNodeProps> = ({
                                                 node,
                                                 onChange,
                                                 rootDefinitions
                                               }) => {
  return (
    <>
      <Accordion className="mb-3">
        <Accordion.Item eventKey="string-parameters">
          <Accordion.Header>Optional Parameters</Accordion.Header>
          <Accordion.Body>
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
                <InputGroup.Text>Default</InputGroup.Text>
                <Form.Control
                  value={node.default}
                  onChange={(e) => onChange({ ...node, default: e.target.value })}
                />
              </InputGroup>
            </Form.Group>

            <Examples
              node={node}
              onChange={onChange}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

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

      {node.specification === 'const' && (
        <ConstNode
          node={node}
          onChange={onChange}
        />
      )}

      {node.specification === 'enum' && (
        <EnumNode
          node={node}
          onChange={onChange}
        />
      )}

      {node.specification === 'reference' && (
        <ReferenceNode
          node={node}
          onChange={onChange}
          rootDefinitions={rootDefinitions}
        />
      )}

      {node.type === 'string' && (
        <StringNode
          node={node as StringSchemaNode}
          onChange={onChange}
        />
      )}

      {(node.type === 'number' || node.type === 'integer') && (
        <NumberNode
          node={node as NumberSchemaNode}
          onChange={onChange}
        />
      )}

      {node.type === 'object' && (
        <ObjectNode
          node={node as ObjectSchemaNode}
          onChange={onChange}
          rootDefinitions={rootDefinitions}
        />
      )}

      {node.type === 'array' && (
        <ArrayNode
          node={node as ArraySchemaNode}
          onChange={onChange}
          rootDefinitions={rootDefinitions}
        />
      )}
    </>
  )
}

export default SimpleNode;
