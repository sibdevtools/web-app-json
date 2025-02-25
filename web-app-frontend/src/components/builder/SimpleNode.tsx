import { Accordion, Form, InputGroup } from 'react-bootstrap';
import React from 'react';
import {
  ArraySchemaNode,
  NodeType,
  NumberSchemaNode,
  ObjectSchemaNode,
  SchemaNode,
  StringSchemaNode
} from '../../const/type';
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
            multiple
            value={node.type}
            disabled={node.type === 'undefined'}
            onChange={(e) => {
              if (e.target.selectedOptions.length === 0) {
                node.type = ['string'];
                return
              }
              const newType: NodeType[] = [];
              for (let selectedOption of e.target.selectedOptions) {
                newType.push(selectedOption.value as NodeType)
              }
              onChange({ ...node, type: newType })
            }
            }
          >
            {['string', 'boolean', 'number', 'integer', 'object', 'array', 'null'].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Form.Select>
          <InputGroup.Text>
            Undefined
          </InputGroup.Text>
          <InputGroup.Checkbox
            type={'checkbox'}
            checked={node.type === 'undefined'}
            onChange={e => onChange({ ...node, type: e.target.checked ? 'undefined' : ['string'] })}
          />
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

      {node.type.includes('string') && (
        <StringNode
          node={node as StringSchemaNode}
          onChange={onChange}
        />
      )}

      {(node.type.includes('number') || node.type.includes('integer')) && (
        <NumberNode
          node={node as NumberSchemaNode}
          onChange={onChange}
        />
      )}

      {node.type.includes('object') && (
        <ObjectNode
          node={node as ObjectSchemaNode}
          onChange={onChange}
          rootDefinitions={rootDefinitions}
        />
      )}

      {node.type.includes('array') && (
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
