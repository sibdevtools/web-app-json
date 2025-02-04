import { Accordion, Form, InputGroup } from 'react-bootstrap';
import React from 'react';
import { NumberSchemaNode, SchemaNode } from '../../const/type';

export interface NumberNodeProps {
  node: NumberSchemaNode;
  onChange: (newNode: SchemaNode) => void;
}

const NumberNode: React.FC<NumberNodeProps> = ({
                                                 node,
                                                 onChange
                                               }) => {
  const handleNumberChange = (field: 'minimum' | 'maximum' | 'exclusiveMinimum' | 'exclusiveMaximum' | 'multipleOf', value: string) => {
    const numberNode = node as NumberSchemaNode;
    const numericValue = value === '' ? undefined : Number(value);
    const updates: Partial<NumberSchemaNode> = { [field]: numericValue };

    if (field === 'minimum' && numberNode.maximum !== undefined && numericValue !== undefined) {
      updates.maximum = Math.max(numberNode.maximum, numericValue);
    }
    if (field === 'maximum' && numberNode.minimum !== undefined && numericValue !== undefined) {
      updates.minimum = Math.min(numberNode.minimum, numericValue);
    }
    if (field === 'exclusiveMinimum' && numberNode.exclusiveMaximum !== undefined && numericValue !== undefined) {
      updates.exclusiveMaximum = Math.max(numberNode.exclusiveMaximum, numericValue);
    }
    if (field === 'exclusiveMaximum' && numberNode.exclusiveMinimum !== undefined && numericValue !== undefined) {
      updates.exclusiveMinimum = Math.min(numberNode.exclusiveMinimum, numericValue);
    }
    if (field === 'multipleOf' && numericValue !== undefined) {
      updates.multipleOf = numericValue;
    }

    onChange({ ...node, ...updates });
  };

  return (
    <Accordion className="mb-3">
      <Accordion.Item eventKey="number-parameters">
        <Accordion.Header>Number Parameters</Accordion.Header>
        <Accordion.Body>
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
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>Exclusive Minimum Value</InputGroup.Text>
              <Form.Control
                type="number"
                value={node.exclusiveMinimum ?? ''}
                onChange={(e) => handleNumberChange('exclusiveMinimum', e.target.value)}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>Exclusive Maximum Value</InputGroup.Text>
              <Form.Control
                type="number"
                value={node.exclusiveMaximum ?? ''}
                onChange={(e) => handleNumberChange('exclusiveMaximum', e.target.value)}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>Multiple Of</InputGroup.Text>
              <Form.Control
                type="number"
                value={node.multipleOf ?? ''}
                onChange={(e) => handleNumberChange('multipleOf', e.target.value)}
              />
            </InputGroup>
          </Form.Group>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  )
}

export default NumberNode;
