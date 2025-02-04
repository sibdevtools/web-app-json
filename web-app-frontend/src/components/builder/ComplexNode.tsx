import { Accordion, Button } from 'react-bootstrap';
import React from 'react';
import { SchemaNode } from '../../const/type';
import SchemaFormBuilder, { initialSchema } from '../SchemaFormBuilder';
import SimpleNode from './SimpleNode';
import { LineiconsPlus, LineiconsTrash3 } from '../../const/icons';


export interface ComplexNodeProps {
  node: SchemaNode;
  onChange: (newNode: SchemaNode) => void;
  rootDefinitions?: Record<string, SchemaNode>;
}

const ComplexNode: React.FC<ComplexNodeProps> = ({
                                                   node,
                                                   onChange,
                                                   rootDefinitions
                                                 }) => {
  if (node.nodeType === 'simple') {
    return (
      <SimpleNode
        node={node}
        onChange={onChange}
        rootDefinitions={rootDefinitions}
      />
    )
  }

  return (
    <Accordion defaultActiveKey="0" className="mb-3">
      <Accordion.Item eventKey={node.nodeType}>
        <Accordion.Header>{node.nodeType}</Accordion.Header>
        <Accordion.Body>
          {node[node.nodeType]?.map((schema, index) => (
            <Accordion key={index} className="mb-3">
              <Accordion.Item eventKey={String(index)}>
                <Accordion.Header>Schema {index + 1}</Accordion.Header>
                <Accordion.Body>
                  <SchemaFormBuilder
                    node={schema}
                    onChange={(newSchema) => {
                      if (node.nodeType === 'simple') {
                        return
                      }
                      const newSchemas = [...node[node.nodeType]!];
                      newSchemas[index] = newSchema;
                      onChange({ ...node, [node.nodeType]: newSchemas });
                    }}
                    rootDefinitions={rootDefinitions}
                  />
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (node.nodeType === 'simple') {
                        return
                      }
                      const newSchemas = node[node.nodeType]?.filter((_, i) => i !== index);
                      onChange({ ...node, [node.nodeType]: newSchemas });
                    }}
                  >
                    <LineiconsTrash3 />
                  </Button>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          ))}
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => {
              if (node.nodeType === 'simple') {
                return
              }
              const newSchemas = [...(node[node.nodeType] || []), initialSchema];
              onChange({ ...node, [node.nodeType]: newSchemas });
            }}
          >
            <LineiconsPlus />
          </Button>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  )
}

export default ComplexNode;
