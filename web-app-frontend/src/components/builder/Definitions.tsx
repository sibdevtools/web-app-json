import { Accordion, Button, Form, InputGroup } from 'react-bootstrap';
import React from 'react';
import SchemaFormBuilder, { initialSchema } from '../SchemaFormBuilder';
import { SchemaNode } from '../../const/type';
import { LineiconsPlus, LineiconsTrash3 } from '../../const/icons';


function renameField(obj: Record<string, SchemaNode>, oldKey: string, newKey: string): Record<string, SchemaNode> {
  if (oldKey in obj) {
    const { [oldKey]: value, ...rest } = obj;
    return { ...rest, [newKey]: value };
  }
  return obj;
}

export interface DefinitionsProps {
  node: SchemaNode;
  onChange: (newNode: SchemaNode) => void;
  rootDefinitions?: Record<string, SchemaNode>;
}

const Definitions: React.FC<DefinitionsProps> = ({
                                                   node,
                                                   onChange,
                                                   rootDefinitions
                                                 }) => {
  return (
    <Accordion className="mt-3">
      <Accordion.Item eventKey="definitions">
        <Accordion.Header>Definitions</Accordion.Header>
        <Accordion.Body>
          <Accordion className="mb-3">
            {Object.entries(node.definitions || {}).map(([name, defNode], index) => (
              <Accordion.Item eventKey={`definition-${index}`}>
                <Accordion.Header>{name}</Accordion.Header>
                <Accordion.Body>
                  <div key={`definition-${index}`} className="border p-3 mb-3">
                    <Form.Group className="mb-3">
                      <InputGroup>
                        <InputGroup.Text>Name</InputGroup.Text>
                        <Form.Control
                          value={name}
                          onChange={(e) => {
                            const newDefinitions = renameField(node.definitions || {}, name, e.target.value)
                            onChange({ ...node, definitions: newDefinitions });
                          }}
                        />
                        <Button
                          variant="danger"
                          onClick={() => {
                            const newDefinitions = { ...node.definitions };
                            delete newDefinitions[name];
                            onChange({ ...node, definitions: newDefinitions });
                          }}
                        >
                          <LineiconsTrash3 />
                        </Button>
                      </InputGroup>
                    </Form.Group>
                    <SchemaFormBuilder
                      node={defNode}
                      onChange={(newDefNode) => {
                        const newDefinitions = { ...node.definitions };
                        newDefinitions[name] = newDefNode;
                        onChange({ ...node, definitions: newDefinitions });
                      }}
                      rootDefinitions={rootDefinitions}
                    />
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => {
              const newName = `definition${Object.keys(node.definitions || {}).length + 1}`;
              const newDefinitions = { ...node.definitions || {}, [newName]: initialSchema };
              onChange({ ...node, definitions: newDefinitions });
            }}
          >
            <LineiconsPlus />
          </Button>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

export default Definitions;
