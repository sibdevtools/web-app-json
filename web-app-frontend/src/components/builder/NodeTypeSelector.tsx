import { Form, InputGroup } from 'react-bootstrap';
import React from 'react';
import { initialSchema } from '../SchemaFormBuilder';
import { SchemaNode } from '../../const/type';

export interface NodeTypeSelectorProps {
  node: SchemaNode;
  onChange: (newNode: SchemaNode) => void;
}

const NodeTypeSelector: React.FC<NodeTypeSelectorProps> = ({
                                                             node,
                                                             onChange
                                                           }) => {
  return (
    <Form.Group className="mb-3">
      <InputGroup>
        <InputGroup.Text>Node Type</InputGroup.Text>
        <Form.Select
          value={node.nodeType}
          onChange={(e) => {
            const newNode = { ...node, nodeType: e.target.value as 'simple' | 'oneOf' | 'anyOf' | 'allOf' };
            if (newNode.nodeType !== 'simple') {
              newNode[newNode.nodeType] = node.nodeType === 'simple' ? [initialSchema] : (node[node.nodeType] || [initialSchema]);
            } else {
              delete newNode.oneOf;
              delete newNode.anyOf;
              delete newNode.allOf;
            }
            onChange(newNode);
          }}
        >
          <option value="simple">Simple</option>
          <option value="oneOf">One Of</option>
          <option value="anyOf">Any Of</option>
          <option value="allOf">All Of</option>
        </Form.Select>
      </InputGroup>
    </Form.Group>
  );
}

export default NodeTypeSelector;
