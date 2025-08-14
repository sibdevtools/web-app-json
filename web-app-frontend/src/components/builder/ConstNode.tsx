import { Form, InputGroup } from 'react-bootstrap';
import React from 'react';
import { SchemaNode } from '../../const/type';


export interface ConstNodeProps {
  node: SchemaNode;
  onChange: (newNode: SchemaNode) => void;
}

const ConstNode: React.FC<ConstNodeProps> = ({
                                               node,
                                               onChange,
                                             }) => {
  return (
    <Form.Group className="mb-3">
      <InputGroup>
        <InputGroup.Text>Const</InputGroup.Text>
        <Form.Control
          value={node.const || ''}
          onChange={(e) => onChange({ ...node, const: e.target.value })}
          placeholder={'JSON value (e.g., true, 42, &quot;text&quot;, [])'}
        />
      </InputGroup>
    </Form.Group>
  )
}

export default ConstNode;
