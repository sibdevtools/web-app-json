import { Accordion, Button, Form, InputGroup } from 'react-bootstrap';
import React from 'react';
import SchemaFormBuilder, { initialSchema } from '../SchemaFormBuilder';
import { Definition, SchemaNode } from '../../const/type';
import { LineiconsPlus, LineiconsTrash3 } from '../../const/icons';

export interface DefinitionsProps {
  node: SchemaNode;
  onChange: (newNode: SchemaNode) => void;
  rootDefinitions?: string[];
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
            {(node.definitions || []).map((definition, index) => (
              <Accordion.Item eventKey={`definition-${index}`}>
                <Accordion.Header>{definition.id}</Accordion.Header>
                <Accordion.Body>
                  <Form.Group className="mb-3">
                    <InputGroup>
                      <InputGroup.Text>Name</InputGroup.Text>
                      <Form.Control
                        value={definition.id}
                        onChange={(e) => {
                          const newDefinitions = [...(node.definitions ?? [])];
                          let definition = newDefinitions[index].definition;
                          newDefinitions[index] = {
                            id: e.target.value,
                            definition: definition,
                          };
                          onChange({ ...node, definitions: newDefinitions });
                        }}
                      />
                      <Button
                        variant="danger"
                        onClick={() => {
                          const definitions = node.definitions?.filter((_, i) => i !== index) ?? [];
                          onChange({ ...node, definitions: definitions });
                        }}
                      >
                        <LineiconsTrash3 />
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  <SchemaFormBuilder
                    node={definition.definition}
                    onChange={(newDefNode) => {
                      const newDefinitions = [...(node.definitions ?? [])];
                      newDefinitions[index] = {
                        id: newDefNode.id ?? definition.id,
                        definition: newDefNode,
                      };
                      onChange({ ...node, definitions: newDefinitions });
                    }}
                    rootDefinitions={rootDefinitions}
                  />
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => {
              const definition: Definition = {
                id: 'definition',
                definition: initialSchema
              }
              const newDefinitions = [...node.definitions || [], definition];
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
