import React from 'react';
import { SchemaNode } from '../const/type';
import Definitions from './builder/Definitions';
import SimpleNode from './builder/SimpleNode';
import ComplexNode from './builder/ComplexNode';
import NodeTypeSelector from './builder/NodeTypeSelector';
import { Form, InputGroup } from 'react-bootstrap';
import SuggestiveInput from './suggestive-input/SuggestiveInput';

export const initialSchema: SchemaNode = {
  nodeType: 'simple',
  type: ['string'],
  specification: 'none',
  title: '',
  description: '',
};

const schemas = [
  'http://json-schema.org/draft-06/schema',
  'http://json-schema.org/draft-07/schema',
  'https://json-schema.org/draft/2019-09/schema',
  'https://json-schema.org/draft/2020-12/schema',
];

const SchemaFormBuilder: React.FC<{
  node: SchemaNode;
  onChange: (newNode: SchemaNode) => void;
  rootDefinitions?: string[];
  isRoot?: boolean;
}> = ({ node, onChange, rootDefinitions, isRoot = false }) => {
  return (
    <>
      {isRoot && (
        <>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>Id</InputGroup.Text>
              <Form.Control
                value={node.id}
                onChange={(e) => onChange({ ...node, id: e.target.value })}
                maxLength={1024}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>Schema</InputGroup.Text>
              <SuggestiveInput
                mode={'strict'}
                value={node.schema}
                onChange={(e) => onChange({ ...node, schema: e.value })}
                required={true}
                suggestions={schemas.map(it => {
                  return { key: it, value: it };
                })}
                maxSuggestions={5}
              />
            </InputGroup>
          </Form.Group>
        </>
      )
      }

      <NodeTypeSelector
        node={node}
        onChange={onChange}
      />

      {node.nodeType === 'simple' && (
        <SimpleNode
          node={node}
          onChange={onChange}
          rootDefinitions={rootDefinitions}
        />
      )}

      {node.nodeType !== 'simple' && (
        <ComplexNode
          node={node}
          onChange={onChange}
          rootDefinitions={rootDefinitions}
        />
      )}

      {isRoot && (
        <Definitions
          node={node}
          onChange={onChange}
          rootDefinitions={rootDefinitions}
        />
      )}
    </>
  );
};

export default SchemaFormBuilder;
