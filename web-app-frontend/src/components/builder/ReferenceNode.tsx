import { Form, InputGroup } from 'react-bootstrap';
import React from 'react';
import { SchemaNode } from '../../const/type';
import SuggestiveInput from '../suggestive-input/SuggestiveInput';


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
        <SuggestiveInput
          mode={'strict'}
          value={node.reference || ''}
          onChange={(e) => onChange({ ...node, reference: e.value })}
          required={true}
          suggestions={
            Object.keys(rootDefinitions || {})
              .map(it => `#/$defs/${it}`)
              .map(it => {
                return { key: it, value: it }
              })
          }
          maxSuggestions={10}
        />
      </InputGroup>
    </Form.Group>
  )
}

export default ReferenceNode;
