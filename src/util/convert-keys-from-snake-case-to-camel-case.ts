const snakeToCamel = (str: string) => {
  return str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", "")
    )
    .replaceAll("_", "");
};

export const convertKeysFromSnakeCaseToCamelCase = <Type>(
  obj: Record<string, unknown> | Array<Record<string, unknown>>
): Type => {
  const result: typeof obj = Array.isArray(obj) ? [] : {};

  if (Array.isArray(obj) && Array.isArray(result)) {
    obj.forEach((element) => {
      if (typeof element !== "object") {
        result.push(element);
      } else {
        result.push(convertKeysFromSnakeCaseToCamelCase(element));
      }
    });
  } else if (!Array.isArray(obj) && !Array.isArray(result)) {
    Object.entries(obj).forEach(([key, value]) => {
      if (value && typeof value === "object") {
        value = convertKeysFromSnakeCaseToCamelCase(
          value as Record<string, unknown>
        );
      }

      result[snakeToCamel(key)] = value;
    });
  }

  return result as Type;
};
