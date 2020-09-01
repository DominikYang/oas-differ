import * as $RefParser from "@apidevtools/json-schema-ref-parser";
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { compareOpenApi } from "./utils/open_api_compare";
import * as path from 'path';
export const output = path.resolve(`$(__dirname)`, '../out/');
export async function oasDiff(leftPath: string, rightPath: string, outputPath: string = output, name: string = 'out.json') {
  const rawLeft = yaml.safeLoad(fs.readFileSync(leftPath));
  const rawRight = yaml.safeLoad(fs.readFileSync(rightPath));
  let left, right;
  try {
    left = await $RefParser.dereference(rawLeft);
    right = await $RefParser.dereference(rawRight);
  }
  catch (err) {
    left;
    console.error(err);
  }
  let res = compareOpenApi(left, right);
  fs.writeFileSync(outputPath + '\\' + name, JSON.stringify(res, null, "\t"));
}

oasDiff('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/raw.yml',
  'C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/oneOf-test.yml', output, 'oneOf-test-output.json');
oasDiff('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/raw.yml',
  'C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/api-changed.yml', output, 'api-changed-output.json');
oasDiff('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/raw.yml',
  'C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/parameters-changed.yml', output, 'parameters-changed-output.json');
oasDiff('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/raw.yml',
  'C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/properties-changed.yml', output, 'properties-changed-output.json');
oasDiff('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/raw.yml',
  'C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/schema-changed.yml', output, 'schema-changed-output.json');