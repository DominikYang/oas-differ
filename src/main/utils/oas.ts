enum pathItemObject {
  ref = '$ref',
  summary = 'summary',
  get = 'get',
  post = 'post',
  put = 'put',
  delete = 'delete',
  options = 'options',
  head = 'head',
  patch = 'patch',
  trace = 'trace',
  servers = 'servers',
  paramaters = 'paramaters'
}

enum operationObject {
  description = 'description',
  parameters = 'parameters',
  requestBody = 'requestBody',
  responses = 'responses',
  security = 'security'
}

enum parameterObject {
  description = 'description',
  required = 'required'
}

enum SchemaRawProperties {
  title = 'title',
  multipleOf = 'multipleOf',
  maximum = 'maximum',
  exclusiveMaximum = 'exclusiveMaximum',
  minimum = 'minimum',
  exclusiveMinimum = 'exclusiveMinimum',
  maxLength = 'maxLength',
  minLength = 'minLength',
  pattern = 'pattern',
  maxItems = 'maxItems',
  minItems = 'minItems',
  uniqueItems = 'uniqueItems',
  maxProperties = 'maxProperties',
  minProperties = 'minProperties',
  required = 'required',
  enum = 'enum'
}