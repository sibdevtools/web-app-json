import { initialSchema } from '../components/SchemaFormBuilder';
import {
  ArraySchemaNode,
  NodeType,
  NumberSchemaNode,
  ObjectSchemaNode,
  SchemaNode,
  StringSchemaNode
} from '../const/type';

export function convertToJsonSchema(node: SchemaNode, isRoot: boolean = false): any {
  const schema: any = {
    $id: node.id || undefined,
    $schema: node.schema || undefined,
    title: node.title || undefined,
    description: node.description || undefined,
  };

  if (node.type !== 'undefined') {
    if (node.type.length === 1) {
      schema.type = node.type[0];
    } else {
      schema.type = node.type;
    }
  }

  if (node.nodeType === 'simple') {
    switch (node.specification) {
      case 'const':
        if (node.const) schema.const = JSON.parse(node.const);
        break;
      case 'enum':
        if (node.enum) schema.enum = node.enum?.filter(it => it.length > 0)?.map(it => JSON.parse(it));
        break;
      case 'reference':
        if (node.reference) {
          schema.$ref = node.reference;
        }
        break;
    }

    if (node.type.includes('string')) {
      if (node.default !== undefined && node.default.length > 0) {
        schema.default = node.default
      }
      const stringNode = node as StringSchemaNode;
      if (stringNode.minLength !== undefined) schema.minLength = stringNode.minLength;
      if (stringNode.maxLength !== undefined) schema.maxLength = stringNode.maxLength;
      if (stringNode.pattern) schema.pattern = stringNode.pattern;
      if (stringNode.format) schema.format = stringNode.format;
    }
    if (node.type.includes('integer') || node.type.includes('number')) {
      if (node.default !== undefined && node.default.length > 0) {
        schema.default = Number(node.default)
      }
      const numberNode = node as NumberSchemaNode;
      if (numberNode.minimum !== undefined) schema.minimum = numberNode.minimum;
      if (numberNode.exclusiveMinimum !== undefined) schema.exclusiveMinimum = numberNode.exclusiveMinimum;
      if (numberNode.maximum !== undefined) schema.maximum = numberNode.maximum;
      if (numberNode.exclusiveMaximum !== undefined) schema.exclusiveMaximum = numberNode.exclusiveMaximum;
      if (numberNode.multipleOf !== undefined) schema.multipleOf = numberNode.multipleOf;
    }
    if (node.type.includes('object')) {
      if (node.default !== undefined && node.default.length > 0) {
        schema.default = JSON.parse(node.default)
      }
      const objectNode = node as ObjectSchemaNode;
      if (objectNode.additionalProperties === 'false') schema.additionalProperties = false;
      else if (objectNode.additionalProperties === 'true') schema.additionalProperties = true;
      schema.minProperties = objectNode.minProperties;
      schema.maxProperties = objectNode.maxProperties;
      if (objectNode.properties && objectNode.properties.length > 0) {
        schema.properties = objectNode.properties.reduce((acc, prop) => {
          acc[prop.name] = convertToJsonSchema(prop.schema);
          return acc;
        }, {} as Record<string, any>);

        const required = objectNode.properties
          .filter(prop => prop.required)
          .map(prop => prop.name);
        if (required.length > 0) {
          schema.required = required;
        }
      }
      if (objectNode.patternProperties && objectNode.patternProperties.length > 0) {
        schema.patternProperties = objectNode.patternProperties.reduce((acc, prop) => {
          acc[prop.name] = convertToJsonSchema(prop.schema);
          return acc;
        }, {} as Record<string, any>);
      }
    }
    if (node.type.includes('array')) {
      if (node.default !== undefined && node.default.length > 0) {
        schema.default = JSON.parse(node.default)
      }
      const arrayNode = node as ArraySchemaNode;
      if (arrayNode.minItems !== undefined) schema.minItems = arrayNode.minItems;
      if (arrayNode.maxItems !== undefined) schema.maxItems = arrayNode.maxItems;
      if (arrayNode.items) schema.items = convertToJsonSchema(arrayNode.items);
    }
    if (node.type.includes('boolean')) {
      if (node.default !== undefined && node.default.length > 0) {
        schema.default = 'true' === node.default
      }
    }

    if (node.examples) {
      const examples = node.examples?.filter(it => it.length > 0)?.map(it => JSON.parse(it));
      if (examples?.length > 0) {
        schema.examples = examples;
      }
    }

  } else {
    schema[node.nodeType] = node[node.nodeType]?.map(schemaNode => convertToJsonSchema(schemaNode));
  }

  const definitions = isRoot && node.definitions ? Object.entries(node.definitions) : [];
  if (definitions && definitions.length > 0) {
    schema.$defs = definitions.reduce((acc, [name, defNode]) => {
      acc[name] = convertToJsonSchema(defNode);
      return acc;
    }, {} as Record<string, any>);
  }

  return schema;
}


export function parseJsonSchema(json: any): SchemaNode {
  let type: SchemaNode['type'] = 'undefined';
  let specification: SchemaNode['specification'] = 'none';

  let nodeType: 'simple' | 'oneOf' | 'anyOf' | 'allOf' = 'simple';
  if (json.oneOf) nodeType = 'oneOf';
  else if (json.anyOf) nodeType = 'anyOf';
  else if (json.allOf) nodeType = 'allOf';

  if (Array.isArray(json.type)) {
    type = json.type as NodeType[];
  } else if (typeof json.type === 'string') {
    type = [json.type as NodeType];
  }

  if ('const' in json) {
    specification = 'const'
  } else if ('enum' in json) {
    specification = 'enum'
  } else if ('$ref' in json) {
    specification = 'reference'
  }

  let baseNode: SchemaNode = {
    nodeType,
    type,
    specification,
    id: json.$id,
    schema: json.$schema,
    title: json.title || '',
    description: json.description || '',
  };

  switch (specification) {
    case 'const':
      baseNode.const = JSON.stringify(json.const);
      break;
    case 'enum':
      const jsonEnum = json.enum;
      baseNode.enum = []
      if (jsonEnum && typeof jsonEnum[Symbol.iterator] === 'function') {
        for (let jsonEnumItem of jsonEnum) {
          baseNode.enum.push(JSON.stringify(jsonEnumItem))
        }
      }
      break;
    case 'reference':
      baseNode.reference = json['$ref']
      break;
  }

  if ('examples' in json) {
    const jsonExamples = json.examples;
    baseNode.examples = []
    if (jsonExamples && typeof jsonExamples[Symbol.iterator] === 'function') {
      for (let item of jsonExamples) {
        baseNode.examples.push(JSON.stringify(item))
      }
    }
  }

  if (json.allOf) {
    baseNode.allOf = json.allOf.map((schema: any) => parseJsonSchema(schema));
  }
  if (json.anyOf) {
    baseNode.anyOf = json.anyOf.map((schema: any) => parseJsonSchema(schema));
  }
  if (json.oneOf) {
    baseNode.oneOf = json.oneOf.map((schema: any) => parseJsonSchema(schema));
  }

  const defs = Object.entries(json.$defs ?? {})
  if (defs && defs.length > 0) {
    const definitions: Record<string, SchemaNode> = {};
    for (const [name, defJson] of defs) {
      definitions[name] = parseJsonSchema(defJson);
    }
    baseNode.definitions = definitions;
  }

  if (type.includes('string')) {
    baseNode = {
      ...baseNode,
      minLength: json.minLength,
      maxLength: json.maxLength,
      pattern: json.pattern,
      format: json.format,
      default: json.default !== undefined ? json.default : undefined,
    } as StringSchemaNode
  }
  if (type.includes('integer') || type.includes('number')) {
    baseNode = {
      ...baseNode,
      minimum: json.minimum,
      exclusiveMinimum: json.exclusiveMinimum,
      maximum: json.maximum,
      exclusiveMaximum: json.exclusiveMaximum,
      multipleOf: json.multipleOf,
      default: json.default !== undefined ? `${json.default}` : undefined,
    } as NumberSchemaNode
  }
  if (type.includes('object')) {
    baseNode = {
      ...baseNode,
      additionalProperties: json.additionalProperties !== undefined ? `${json.additionalProperties}` : 'undefined',
      minProperties: json.minProperties,
      maxProperties: json.maxProperties,
      properties: Object.entries(json.properties || {}).map(([name, prop]) => ({
        name,
        required: (json.required || []).includes(name),
        schema: parseJsonSchema(prop)
      })),
      patternProperties: Object.entries(json.patternProperties || {}).map(([name, prop]) => ({
        name,
        schema: parseJsonSchema(prop)
      })),
      default: json.default !== undefined ? JSON.stringify(json.default) : undefined,
    } as ObjectSchemaNode
  }
  if (type.includes('array')) {
    baseNode = {
      ...baseNode,
      items: json.items ? parseJsonSchema(json.items) : initialSchema,
      minItems: json.minItems,
      maxItems: json.maxItems,
      default: json.default !== undefined ? JSON.stringify(json.default) : undefined,
    } as ArraySchemaNode
  }
  if (type.includes('boolean')) {
    baseNode = {
      ...baseNode,
      default: json.default !== undefined ? `${json.default}` : undefined,
    } as SchemaNode;
  }

  return baseNode;
}
