import { Form, InputGroup } from 'react-bootstrap';
import React from 'react';
import { SchemaNode } from '../../const/type';


export interface ReferenceNodeProps {
  node: SchemaNode;
  onChange: (newNode: SchemaNode) => void;
  rootDefinitions?: Record<string, SchemaNode>;
}

const ReferenceNode: React.FC<ReferenceNodeProps> = ({
                                                       node,
                                                       onChange,
                                                       rootDefinitions
                                                     }) => {
  return (
    <Form.Group className="mb-3">
      <InputGroup>
        <InputGroup.Text>Reference</InputGroup.Text>
        <Form.Control
          value={node.reference || ''}
          list={'reference-suggestions'}
          onChange={(e) => onChange({ ...node, reference: e.target.value })}
        />
        <datalist id="reference-suggestions">
          {
            Object.keys(rootDefinitions || {})
              .map(it => `#/$defs/${it}`)
              .map(it => <option key={it} value={it} />)
          }
        </datalist>
      </InputGroup>
    </Form.Group>
  )
}

export default ReferenceNode;
