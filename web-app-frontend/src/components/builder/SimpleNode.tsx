import { Accordion, Button, Form, InputGroup } from 'react-bootstrap';
import React, { useState } from 'react';
import {
  ArraySchemaNode,
  NodeType,
  NumberSchemaNode,
  ObjectSchemaNode,
  SchemaNode,
  StringSchemaNode
} from '../../const/type';
import StringNode from './StringNode';
import NumberNode from './NumberNode';
import ObjectNode from './ObjectNode';
import ArrayNode from './ArrayNode';
import ConstNode from './ConstNode';
import EnumNode from './EnumNode';
import ReferenceNode from './ReferenceNode';
import Examples from './Examples';
import { LineiconsMinus, LineiconsPlus } from '../../const/icons';
import { MultipleSuggestiveInput } from '@sibdevtools/frontend-common';

const isValidJsonString = (jsonString: string): boolean => {
  if (jsonString === '') return true; // Empty string is valid (will default to null)
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

export interface SimpleNodeProps {
  node: SchemaNode;
  onChange: (newNode: SchemaNode) => void;
  rootDefinitions?: string[];
}

const nodeTypes = ['string', 'boolean', 'number', 'integer', 'object', 'array', 'null']

const SimpleNode: React.FC<SimpleNodeProps> = ({
                                                 node,
                                                 onChange,
                                                 rootDefinitions
                                               }) => {
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomValue, setNewCustomValue] = useState('');

  const handleAddCustomProperty = () => {
    if (!newCustomKey.trim()) return;

    try {
      const parsedValue = JSON.parse(newCustomValue || 'null');
      const updatedNode = {
        ...node,
        customProperties: {
          ...node.customProperties,
          [newCustomKey.trim()]: parsedValue
        }
      };
      onChange(updatedNode);
      setNewCustomKey('');
      setNewCustomValue('');
    } catch (error) {
      alert('Invalid JSON value. Please enter a valid JSON value.');
    }
  };

  const handleRemoveCustomProperty = (key: string) => {
    if (!node.customProperties) return;

    const { [key]: removed, ...remainingProperties } = node.customProperties;
    const updatedNode = {
      ...node,
      customProperties: Object.keys(remainingProperties).length > 0 ? remainingProperties : undefined
    };
    onChange(updatedNode);
  };

  const handleUpdateCustomProperty = (key: string, value: string) => {
    if (!node.customProperties) return;

    // Always update the display value, even if JSON is invalid
    // The validation will show the error but won't prevent typing
    try {
      const parsedValue = JSON.parse(value);
      const updatedNode = {
        ...node,
        customProperties: {
          ...node.customProperties,
          [key]: parsedValue
        }
      };
      onChange(updatedNode);
    } catch (error) {
      // For invalid JSON, we still need to store the raw string temporarily
      // so the user can continue editing. We'll store it as a special marker.
      const updatedNode = {
        ...node,
        customProperties: {
          ...node.customProperties,
          [key]: { __invalid_json__: value }
        }
      };
      onChange(updatedNode);
    }
  };

  const handleKeyChange = (oldKey: string, newKey: string) => {
    if (!node.customProperties) return;

    // Don't allow empty keys
    if (!newKey.trim()) return;

    // If key hasn't actually changed, do nothing
    if (newKey === oldKey) return;

    // If new key already exists, don't allow the change
    if (node.customProperties[newKey] !== undefined) return;

    const { [oldKey]: value, ...otherProperties } = node.customProperties;
    const updatedNode = {
      ...node,
      customProperties: {
        ...otherProperties,
        [newKey]: value
      }
    };
    onChange(updatedNode);
  };

  const getDisplayValue = (value: any): string => {
    // Handle the special case of invalid JSON storage
    if (value && typeof value === 'object' && value.__invalid_json__) {
      return value.__invalid_json__;
    }
    return JSON.stringify(value);
  };

  const isValidJson = (value: any): boolean => {
    // If it's our special invalid JSON marker, it's invalid
    return !(value && typeof value === 'object' && value.__invalid_json__);
  };

  return (
    <>
      <Accordion className="mb-3">
        <Accordion.Item eventKey="string-parameters">
          <Accordion.Header>Optional Parameters</Accordion.Header>
          <Accordion.Body>
            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text>Title</InputGroup.Text>
                <Form.Control
                  value={node.title}
                  onChange={(e) => onChange({ ...node, title: e.target.value.slice(0, 64) })}
                  maxLength={64}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text>Description</InputGroup.Text>
                <Form.Control
                  value={node.description}
                  onChange={(e) => onChange({ ...node, description: e.target.value.slice(0, 256) })}
                  maxLength={256}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text>Default</InputGroup.Text>
                <Form.Control
                  value={node.default}
                  onChange={(e) => onChange({ ...node, default: e.target.value })}
                />
              </InputGroup>
            </Form.Group>

            <Examples
              node={node}
              onChange={onChange}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Form.Group className="mb-3">
        <InputGroup>
          <InputGroup.Text>
            Type
          </InputGroup.Text>
          <MultipleSuggestiveInput
            onChange={it => {
              onChange({ ...node, type: it.map(it => it.key as NodeType) })
            }}
            required
            disabled={node.type === 'undefined'}
            values={node.type === 'undefined' ? [] : node.type}
            maxSuggestions={nodeTypes.length}
            suggestions={nodeTypes.map(it => {
              return { key: it, value: it }
            })}
          />
          <InputGroup.Text>
            Undefined
          </InputGroup.Text>
          <InputGroup.Checkbox
            type={'checkbox'}
            checked={node.type === 'undefined'}
            onChange={e => onChange({ ...node, type: e.target.checked ? 'undefined' : ['string'] })}
          />
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-3">
        <InputGroup>
          <InputGroup.Text>
            Specification
          </InputGroup.Text>
          <Form.Select
            value={node.specification}
            onChange={(e) => onChange({ ...node, specification: e.target.value as SchemaNode['specification'] })}
          >
            {['none', 'const', 'enum', 'reference'].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Form.Select>
        </InputGroup>
      </Form.Group>

      {node.specification === 'const' && (
        <ConstNode
          node={node}
          onChange={onChange}
        />
      )}

      {node.specification === 'enum' && (
        <EnumNode
          node={node}
          onChange={onChange}
        />
      )}

      {node.specification === 'reference' && (
        <ReferenceNode
          node={node}
          onChange={onChange}
          rootDefinitions={rootDefinitions}
        />
      )}

      {node.type.includes('string') && (
        <StringNode
          node={node as StringSchemaNode}
          onChange={onChange}
        />
      )}

      {(node.type.includes('number') || node.type.includes('integer')) && (
        <NumberNode
          node={node as NumberSchemaNode}
          onChange={onChange}
        />
      )}

      {node.type.includes('object') && (
        <ObjectNode
          node={node as ObjectSchemaNode}
          onChange={onChange}
          rootDefinitions={rootDefinitions}
        />
      )}

      {node.type.includes('array') && (
        <ArrayNode
          node={node as ArraySchemaNode}
          onChange={onChange}
          rootDefinitions={rootDefinitions}
        />
      )}

      <Accordion className="mb-3">
        <Accordion.Item eventKey="custom-parameters">
          <Accordion.Header>Custom Parameters</Accordion.Header>
          <Accordion.Body>
            {/* Existing custom properties */}
            {node.customProperties && Object.entries(node.customProperties).map(([key, value]) => (
              <Form.Group key={key} className="mb-3">
                <InputGroup>
                  <Form.Control
                    value={key}
                    onChange={(e) => handleKeyChange(key, e.target.value)}
                    placeholder="Property key"
                  />
                  <InputGroup.Text>:</InputGroup.Text>
                  <Form.Control
                    value={getDisplayValue(value)}
                    onChange={(e) => handleUpdateCustomProperty(key, e.target.value)}
                    placeholder="JSON value"
                    isInvalid={!isValidJson(value)}
                  />
                  <Button
                    variant="outline-danger"
                    onClick={() => handleRemoveCustomProperty(key)}
                  >
                    <LineiconsMinus />
                  </Button>
                </InputGroup>
                {!isValidJson(value) && (
                  <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                    Please enter a valid JSON value
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            ))}

            {/* Add new custom property */}
            <Form.Group className="mb-3">
              <InputGroup>
                <Form.Control
                  value={newCustomKey}
                  onChange={(e) => setNewCustomKey(e.target.value)}
                  placeholder="Property key"
                />
                <InputGroup.Text>:</InputGroup.Text>
                <Form.Control
                  value={newCustomValue}
                  onChange={(e) => setNewCustomValue(e.target.value)}
                  placeholder="JSON value (e.g., true, 42, &quot;text&quot;, [])"
                  isInvalid={newCustomValue !== '' && !isValidJsonString(newCustomValue)}
                />
                <Button
                  variant="outline-primary"
                  onClick={handleAddCustomProperty}
                  disabled={!newCustomKey.trim() || (newCustomValue !== '' && !isValidJsonString(newCustomValue))}
                >
                  <LineiconsPlus />
                </Button>
              </InputGroup>
              {newCustomValue !== '' && !isValidJsonString(newCustomValue) && (
                <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                  Please enter a valid JSON value
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  )
}

export default SimpleNode;
