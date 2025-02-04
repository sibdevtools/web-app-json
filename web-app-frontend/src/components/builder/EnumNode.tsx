import { Button, Form, InputGroup } from 'react-bootstrap';
import React from 'react';
import { SchemaNode } from '../../const/type';
import { LineiconsMinus, LineiconsPlus } from '../../const/icons';


export interface EnumNodeProps {
  node: SchemaNode;
  onChange: (newNode: SchemaNode) => void;
}

const EnumNode: React.FC<EnumNodeProps> = ({
                                             node,
                                             onChange,
                                           }) => {
  if (!node.enum || node.enum.length === 0) {
    node.enum = [''];
  }
  return (
    <Form.Group>
      <Form.Label>Enum Items</Form.Label>
      {node.enum?.map((it, index) => (
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
                variant="outline-success"
                onClick={() => {
                  const updated = [...(node.enum || [])]
                  updated.splice(index + 1, 0, '');
                  onChange({ ...node, enum: updated });
                }}
              >
                <LineiconsPlus />
              </Button>
              <Button
                variant="outline-danger"
                disabled={node.enum?.length === 1}
                onClick={() => {
                  const newEnum = node.enum?.filter((_, i) => i !== index);
                  onChange({ ...node, enum: newEnum });
                }}
              >
                <LineiconsMinus />
              </Button>
            </InputGroup>
          </Form.Group>
        </>
      ))}
    </Form.Group>
  )
}

export default EnumNode;
