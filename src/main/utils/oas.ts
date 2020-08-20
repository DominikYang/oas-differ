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

enum operationObject{
  description = 'description',
  parameters = 'parameters',
  requestBody = 'requestBody',
  responses = 'responses',
  security = 'security'
}

enum parameterObject{
  description = 'description',
  required = 'required'
}