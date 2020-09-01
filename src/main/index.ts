import * as $RefParser from "@apidevtools/json-schema-ref-parser";
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { compareOpenApi } from "./utils/open_api_compare";

export async function oasDiff(leftPath: string, rightPath: string) {
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
  return res;
}

oasDiff('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/raw.yml',
  'C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/api-changed.yml').then(res => {
    console.log(res);
  })


// oasDiff('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/raw.yml',
//   'C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/oneOf-test.yml').then(res => {
//     console.log(res);
//   })

// oasDiff('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/raw.yml',
//   'C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/properties-changed.yml').then(res => {
//     console.log(res);
//   })

// oasDiff('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/raw.yml',
//   'C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/parameters-changed.yml').then(res => {
//     console.log(res);
//   })