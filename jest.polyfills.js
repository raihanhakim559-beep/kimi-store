import fetch, { Headers, Request, Response } from "node-fetch";
import { TextDecoder, TextEncoder } from "util";

global.TextEncoder ||= TextEncoder;
global.TextDecoder ||= TextDecoder;

if (!global.fetch) {
  global.fetch = fetch;
}
if (!global.Headers) {
  global.Headers = Headers;
}
if (!global.Request) {
  global.Request = Request;
}
if (!global.Response) {
  global.Response = Response;
}
