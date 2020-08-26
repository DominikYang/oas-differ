import * as $RefParser from "@apidevtools/json-schema-ref-parser";
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { compareOpenApi } from "./utils/open_api_compare";

oasDiff('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/public-merged.yml',
  'C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/test-merged.yml')


async function oasDiff(leftPath: string, rightPath: string) {
  const rawLeft = yaml.safeLoad(fs.readFileSync(leftPath));
  const rawRight = yaml.safeLoad(fs.readFileSync(rightPath));
  let left, right;
  try {
    left = await $RefParser.dereference(rawLeft);
    right = await $RefParser.dereference(rawRight);
  }
  catch(err) {
    console.error(err);
  }
  let res = compareOpenApi(left, right);
  console.log(res);
  
  return res;
}