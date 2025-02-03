import { Button, Form, InputGroup } from 'react-bootstrap';
import React from 'react';
import { SchemaNode } from '../../const/type';
import { MinusSignIcon, PlusSignIcon } from 'hugeicons-react';


export interface ExamplesProps {
  node: SchemaNode;
  onChange: (newNode: SchemaNode) => void;
}

const Examples: React.FC<ExamplesProps> = ({
                                             node,
                                             onChange,
                                           }) => {
  if (!node.examples || node.examples.length === 0) {
    node.examples = [''];
  }
  return (
    <Form.Group>
      <Form.Label>Examples</Form.Label>
      {node.examples?.map((it, index) => (
        <>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>Example</InputGroup.Text>
              <Form.Control
                value={it || ''}
                onChange={(e) => {
                  const updated = [...(node.examples || [])]
                  updated[index] = e.target.value
                  onChange({ ...node, examples: updated })
                }}
              />
              <Button
                variant="outline-success"
                onClick={() => {
                  const updated = [...(node.examples || [])]
                  updated.splice(index + 1, 0, '');
                  onChange({ ...node, examples: updated });
                }}
              >
                <PlusSignIcon />
              </Button>
              <Button
                variant="outline-danger"
                disabled={node.examples?.length === 1}
                onClick={() => {
                  const newEnum = node.examples?.filter((_, i) => i !== index);
                  onChange({ ...node, examples: newEnum });
                }}
              >
                <MinusSignIcon />
              </Button>
            </InputGroup>
          </Form.Group>
        </>
      ))}
    </Form.Group>
  )
}

export default Examples;
