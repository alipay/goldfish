export default function isObject(v: any): v is Record<string, any> {
  return typeof v === 'object' && v !== null;
}
