import React from 'react';
import { SchemaNode } from '../const/type';
import Definitions from './builder/Definitions';
import SimpleNode from './builder/SimpleNode';
import ComplexNode from './builder/ComplexNode';
import NodeTypeSelector from './builder/NodeTypeSelector';
import { Form, InputGroup } from 'react-bootstrap';

export const initialSchema: SchemaNode = {
  nodeType: 'simple',
  type: 'string',
  specification: 'none',
  nullable: false,
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
  rootDefinitions?: Record<string, SchemaNode>;
  isRoot?: boolean;
}> = ({ node, onChange, rootDefinitions, isRoot = false }) => {
  return (
    <div className="border p-3 mb-3">
      {isRoot && (
        <Form.Group className="mb-3">
          <InputGroup>
            <InputGroup.Text>Schema</InputGroup.Text>
            <Form.Control
              value={node.schema}
              list={'json-schema-suggestions'}
              onChange={(e) => onChange({ ...node, schema: e.target.value })}
              maxLength={64}
            />
            <datalist id={'json-schema-suggestions'}>
              {schemas.map(it => <option key={it} value={it} />)}
            </datalist>
          </InputGroup>
        </Form.Group>
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
        />
      )}
    </div>
  );
};

export default SchemaFormBuilder;
