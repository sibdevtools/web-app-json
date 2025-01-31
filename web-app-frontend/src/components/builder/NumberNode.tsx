import { Form, InputGroup } from 'react-bootstrap';
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
  const handleNumberChange = (field: 'minimum' | 'maximum', value: string) => {
    const numberNode = node as NumberSchemaNode;
    const numericValue = value === '' ? undefined : Number(value);
    const updates: Partial<NumberSchemaNode> = { [field]: numericValue };

    if (field === 'minimum' && numberNode.maximum !== undefined && numericValue !== undefined) {
      updates.maximum = Math.max(numberNode.maximum, numericValue);
    }
    if (field === 'maximum' && numberNode.minimum !== undefined && numericValue !== undefined) {
      updates.minimum = Math.min(numberNode.minimum, numericValue);
    }

    onChange({ ...node, ...updates });
  };

  return (
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
  )
}

export default NumberNode;
