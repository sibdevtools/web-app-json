import { Accordion, Form, InputGroup } from 'react-bootstrap';
import React from 'react';
import { SchemaNode, StringSchemaNode } from '../../const/type';
import SuggestiveInput from '../suggestive-input/SuggestiveInput';

const buildInFormats = [
  'date-time', 'time', 'date', 'duration',

  'email', 'idn-email',

  'hostname', 'idn-hostname',

  'ipv4', 'ipv6',

  'uuid', 'uri', 'uri-reference', 'iri',

  'uri-template',

  'json-pointer', 'relative-json-pointer',

  'regex'
]

export interface StringNodeProps {
  node: StringSchemaNode;
  onChange: (newNode: SchemaNode) => void;
}


const StringNode: React.FC<StringNodeProps> = ({
                                                 node,
                                                 onChange,
                                               }) => {
  return (
    <Accordion className="mb-3">
      <Accordion.Item eventKey="string-parameters">
        <Accordion.Header>String Parameters</Accordion.Header>
        <Accordion.Body>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>Minimum Length</InputGroup.Text>
              <Form.Control
                type="number"
                value={node.minLength || ''}
                min={0}
                onChange={(e) => onChange({ ...node, minLength: Number(e.target.value) })}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>Maximum Length</InputGroup.Text>
              <Form.Control
                type="number"
                value={node.maxLength || ''}
                min={0}
                onChange={(e) => onChange({ ...node, maxLength: Number(e.target.value) })}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>Pattern</InputGroup.Text>
              <Form.Control
                value={node.pattern || ''}
                onChange={(e) => onChange({ ...node, pattern: e.target.value })}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>Format</InputGroup.Text>
              <SuggestiveInput
                mode={'strict'}
                value={node.format ?? ''}
                onChange={(e) => onChange({ ...node, format: e.value })}
                required={true}
                suggestions={buildInFormats.map(it => {
                  return { key: it, value: it };
                })}
                maxSuggestions={10}
              />
            </InputGroup>
          </Form.Group>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  )
}

export default StringNode;
