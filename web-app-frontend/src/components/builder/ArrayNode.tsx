import { Accordion, Form, InputGroup } from 'react-bootstrap';
import React from 'react';
import SchemaFormBuilder, { initialSchema } from '../SchemaFormBuilder';
import { ArraySchemaNode, SchemaNode } from '../../const/type';

export interface ArrayNodeProps {
  node: ArraySchemaNode;
  onChange: (newNode: SchemaNode) => void;
  rootDefinitions?: Record<string, SchemaNode>;
}

const ArrayNode: React.FC<ArrayNodeProps> = ({
                                               node,
                                               onChange,
                                               rootDefinitions
                                             }) => {
  return (
    <>
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
      <Accordion defaultActiveKey="0" className="mb-3">
        <Accordion.Item eventKey="items">
          <Accordion.Header>Items</Accordion.Header>
          <Accordion.Body>
            <SchemaFormBuilder
              node={node.items || initialSchema}
              onChange={(items) => onChange({ ...node, items })}
              rootDefinitions={rootDefinitions}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  )
}

export default ArrayNode;
