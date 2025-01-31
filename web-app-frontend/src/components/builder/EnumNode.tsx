import { Button, Form, InputGroup } from 'react-bootstrap';
import React from 'react';
import { SchemaNode } from '../../const/type';


export interface EnumNodeProps {
  node: SchemaNode;
  onChange: (newNode: SchemaNode) => void;
}

const EnumNode: React.FC<EnumNodeProps> = ({
                                             node,
                                             onChange,
                                           }) => {
  return (
    <>
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
  )
}

export default EnumNode;
