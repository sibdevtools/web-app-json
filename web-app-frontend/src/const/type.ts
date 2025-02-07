// Base interface for all schema nodes
export type NodeType = 'string' | 'boolean' | 'number' | 'integer' | 'object' | 'array' | 'null'

export interface BaseSchemaNode {
  nodeType: 'simple' | 'oneOf' | 'anyOf' | 'allOf';
  type: 'undefined' | NodeType[];
  specification: 'none' | 'enum' | 'const' | 'reference';
  const?: string;
  enum?: Array<string>;
  reference?: string;
  definitions?: Record<string, SchemaNode>;
  title: string;
  description: string;
  default?: string;
  id?: string;
  schema?: string;
  examples?: string[];
  allOf?: SchemaNode[];
  anyOf?: SchemaNode[];
  oneOf?: SchemaNode[];
}

// Interface for string type schema nodes
export interface StringSchemaNode extends BaseSchemaNode {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
}

// Interface for number/integer type schema nodes
export interface NumberSchemaNode extends BaseSchemaNode {
  minimum?: number;
  exclusiveMinimum?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
}

// Interface for object type schema nodes
export interface ObjectSchemaNode extends BaseSchemaNode {
  properties?: Array<{
    name: string;
    required: boolean;
    schema: SchemaNode;
  }>;
  patternProperties?: Array<{
    name: string;
    schema: SchemaNode;
  }>;
  additionalProperties: 'undefined' | 'true' | 'false';
  minProperties?: number;
  maxProperties?: number;
}

// Interface for array type schema nodes
export interface ArraySchemaNode extends BaseSchemaNode {
  items?: SchemaNode;
  minItems?: number;
  maxItems?: number;
}

// Union type for all schema nodes
export type SchemaNode =
  | BaseSchemaNode
  | StringSchemaNode
  | NumberSchemaNode
  | ObjectSchemaNode
  | ArraySchemaNode;
