import { initialSchema, SchemaNode } from '../components/SchemaFormBuilder';

export function convertToJsonSchema(node: SchemaNode, isRoot: boolean = false): any {
  const baseType = node.type === 'null' ? 'null' : node.type;
  const type = node.nullable ? ['null', baseType] : baseType;

  const schema: any = {
    title: node.title || undefined,
    description: node.description || undefined,
  };

  if (baseType !== 'undefined') {
    schema.type = type;
  }

  switch (node.type) {
    case 'string':
      if (node.minLength !== undefined) schema.minLength = node.minLength;
      if (node.maxLength !== undefined) schema.maxLength = node.maxLength;
      if (node.pattern) schema.pattern = node.pattern;
      if (node.format) schema.format = node.format;
      break;
    case 'integer':
    case 'number':
      if (node.minimum !== undefined) schema.minimum = node.minimum;
      if (node.maximum !== undefined) schema.maximum = node.maximum;
      break;
    case 'object':
      schema.additionalProperties = node.additionalProperties;
      if (node.properties) {
        schema.properties = node.properties.reduce((acc, prop) => {
          acc[prop.name] = convertToJsonSchema(prop.schema);
          return acc;
        }, {} as Record<string, any>);

        const required = node.properties
          .filter(prop => prop.required)
          .map(prop => prop.name);
        if (required.length > 0) {
          schema.required = required;
        }
      }
      break;
    case 'array':
      if (node.items) schema.items = convertToJsonSchema(node.items);
      if (node.minItems !== undefined) schema.minItems = node.minItems;
      if (node.maxItems !== undefined) schema.maxItems = node.maxItems;
      break;
  }

  switch (node.specification) {
    case 'const':
      if (node.const) schema.const = JSON.parse(node.const);
      break;
    case 'enum':
      if (node.enum) schema.enum = node.enum?.map(it => JSON.parse(it));
      break;
    case 'reference':
      if (node.reference) {
        schema.$ref = node.reference;
      }
      break;
  }

  if (isRoot && node.definitions) {
    schema.$defs = Object.entries(node.definitions).reduce((acc, [name, defNode]) => {
      acc[name] = convertToJsonSchema(defNode);
      return acc;
    }, {} as Record<string, any>);
  }

  return schema;
}


export function parseJsonSchema(json: any): SchemaNode {
  let type: SchemaNode['type'] = 'undefined';
  let specification: SchemaNode['specification'] = 'none';
  let nullable = false;

  if (Array.isArray(json.type)) {
    const types = json.type.filter((t: string) => t !== 'null');
    type = types[0] || 'null';
    nullable = json.type.includes('null');
  } else if (typeof json.type === 'string') {
    type = json.type as SchemaNode['type'];
  }

  if ('const' in json) {
    specification = 'const'
  } else if ('enum' in json) {
    specification = 'enum'
  } else if ('$ref' in json) {
    specification = 'reference'
  }

  const baseNode: SchemaNode = {
    type,
    specification,
    nullable,
    title: json.title || '',
    description: json.description || '',
    additionalProperties: json.additionalProperties ?? true,
  };

  switch (type) {
    case 'string':
      baseNode.minLength = json.minLength;
      baseNode.maxLength = json.maxLength;
      baseNode.pattern = json.pattern;
      baseNode.format = json.format;
      break;
    case 'integer':
    case 'number':
      baseNode.minimum = json.minimum;
      baseNode.maximum = json.maximum;
      break;
    case 'object':
      baseNode.properties = Object.entries(json.properties || {}).map(([name, prop]) => ({
        name,
        required: (json.required || []).includes(name),
        schema: parseJsonSchema(prop)
      }));
      break;
    case 'array':
      baseNode.items = json.items ? parseJsonSchema(json.items) : initialSchema;
      baseNode.minItems = json.minItems;
      baseNode.maxItems = json.maxItems;
      break;
  }

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

  if (json.$defs) {
    const definitions: Record<string, SchemaNode> = {};
    for (const [name, defJson] of Object.entries(json.$defs)) {
      definitions[name] = parseJsonSchema(defJson);
    }
    baseNode.definitions = definitions;
  }

  return baseNode;
}
