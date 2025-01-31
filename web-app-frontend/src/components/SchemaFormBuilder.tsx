import React from 'react';
import { SchemaNode } from '../const/type';
import Definitions from './builder/Definitions';
import SimpleNode from './builder/SimpleNode';
import ComplexNode from './builder/ComplexNode';
import NodeTypeSelector from './builder/NodeTypeSelector';

export const initialSchema: SchemaNode = {
  nodeType: 'simple',
  type: 'string',
  specification: 'none',
  nullable: false,
  title: '',
  description: '',
};


const SchemaFormBuilder: React.FC<{
  node: SchemaNode;
  onChange: (newNode: SchemaNode) => void;
  rootDefinitions?: Record<string, SchemaNode>;
  isRoot?: boolean;
}> = ({ node, onChange, rootDefinitions, isRoot = false }) => {
  return (
    <div className="border p-3 mb-3">
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
