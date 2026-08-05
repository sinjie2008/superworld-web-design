export function createDataError(kind, message, details = {}) {
    const error = new Error(message);
    error.name = "SpecSearchDataError";
    error.kind = kind;
    Object.assign(error, details);
    return error;
}
export function actualType(value) {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
}

export function safeValue(value) {
    if (value === null || ["string", "number", "boolean", "undefined"].includes(typeof value)) {
        return String(value).slice(0, 120);
    }
    return Array.isArray(value) ? `[array length=${value.length}]` : "[object]";
}

export function contractFailure(path, expected, value) {
    const details = {
        path,
        expected,
        actualType: actualType(value),
        safeValue: safeValue(value)
    };
    console.error("Spec Search contract error", details);
    throw createDataError(
        "contract",
        `Invalid response at ${path}: expected ${expected}, received ${details.actualType}`,
        details
    );
}

export function expectContract(condition, path, expected, value) {
    if (!condition) contractFailure(path, expected, value);
}

export function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function validateErrorEnvelope(error, path) {
    expectContract(isPlainObject(error), path, "error object", error);
    expectContract(
        typeof error.code === "string" && error.code.length > 0,
        `${path}.code`,
        "non-empty string",
        error.code
    );
    expectContract(
        typeof error.message === "string" && error.message.length > 0,
        `${path}.message`,
        "non-empty string",
        error.message
    );
    expectContract(
        typeof error.correlationId === "string" && error.correlationId.length > 0,
        `${path}.correlationId`,
        "non-empty string",
        error.correlationId
    );
    return error;
}

export function validateEnvelope(response, endpointName) {
    expectContract(isPlainObject(response), endpointName, "response object", response);

    if (isPlainObject(response.error)) {
        const error = validateErrorEnvelope(response.error, `${endpointName}.error`);
        throw createDataError("api", error.message, {
            code: error.code,
            correlationId: error.correlationId
        });
    }

    expectContract(response.success === true, `${endpointName}.success`, "true", response.success);
    expectContract(isPlainObject(response.data), `${endpointName}.data`, "object", response.data);
    expectContract(
        typeof response.correlationId === "string" && response.correlationId.length > 0,
        `${endpointName}.correlationId`,
        "non-empty string",
        response.correlationId
    );
    return response;
}

export function validateIdName(value, path) {
    expectContract(isPlainObject(value), path, "object", value);
    expectContract(Number.isInteger(value.id) && value.id > 0, `${path}.id`, "positive integer", value.id);
    expectContract(typeof value.name === "string" && value.name.length > 0, `${path}.name`, "non-empty string", value.name);
}

export function validateRootResponse(response) {
    const valid = validateEnvelope(response, "rootCategories");
    const categories = valid.data.categories;
    expectContract(Array.isArray(categories), "rootCategories.data.categories", "array", categories);
    const seen = new Set();
    categories.forEach((category, index) => {
        validateIdName(category, `rootCategories.data.categories[${index}]`);
        expectContract(!seen.has(category.id), `rootCategories.data.categories[${index}].id`, "unique ID", category.id);
        seen.add(category.id);
    });
    return valid;
}
export function validateProductCategoryResponse(response) {
    const valid = validateEnvelope(response, "productCategories");
    const groups = valid.data.groups;
    expectContract(Array.isArray(groups), "productCategories.data.groups", "array", groups);
    const seen = new Set();
    groups.forEach((group, groupIndex) => {
        const path = `productCategories.data.groups[${groupIndex}]`;
        expectContract(isPlainObject(group), path, "object", group);
        expectContract(typeof group.group === "string", `${path}.group`, "string", group.group);
        expectContract(Array.isArray(group.categories), `${path}.categories`, "array", group.categories);
        group.categories.forEach((category, categoryIndex) => {
            const categoryPath = `${path}.categories[${categoryIndex}]`;
            validateIdName(category, categoryPath);
            expectContract(!seen.has(category.id), `${categoryPath}.id`, "unique category ID", category.id);
            seen.add(category.id);
        });
    });
    return valid;
}

export function validateFacetResponse(response) {
    const valid = validateEnvelope(response, "facets");
    const facets = valid.data.facets;
    expectContract(Array.isArray(facets), "facets.data.facets", "array", facets);
    const seenKeys = new Set();
    facets.forEach((facet, facetIndex) => {
        const path = `facets.data.facets[${facetIndex}]`;
        expectContract(isPlainObject(facet), path, "object", facet);
        expectContract(typeof facet.key === "string" && facet.key.length > 0, `${path}.key`, "non-empty string", facet.key);
        expectContract(typeof facet.label === "string" && facet.label.length > 0, `${path}.label`, "non-empty string", facet.label);
        expectContract(!seenKeys.has(facet.key), `${path}.key`, "unique facet key", facet.key);
        seenKeys.add(facet.key);
        expectContract(Array.isArray(facet.values), `${path}.values`, "string array", facet.values);
        const seenValues = new Set();
        facet.values.forEach((value, valueIndex) => {
            expectContract(
                typeof value === "string" && value.length > 0,
                `${path}.values[${valueIndex}]`,
                "non-empty string",
                value
            );
            expectContract(!seenValues.has(value), `${path}.values[${valueIndex}]`, "unique value", value);
            seenValues.add(value);
        });
    });
    return valid;
}

export function validateProductResponse(response, input) {
    const valid = validateEnvelope(response, "products");
    const { items, total } = valid.data;
    expectContract(Array.isArray(items), "products.data.items", "array", items);
    expectContract(Number.isInteger(total) && total >= 0, "products.data.total", "non-negative integer", total);
    expectContract(total === items.length, "products.data.total", "items.length", total);

    const selectedCategoryIds = new Set(input.categoryIds);
    const seenIds = new Set();
    const requiredStrings = ["sku", "name", "series", "category"];
    const optionalUrlStrings = ["seriesImage", "pdfDownload"];

    items.forEach((product, productIndex) => {
        const path = `products.data.items[${productIndex}]`;
        expectContract(isPlainObject(product), path, "object", product);
        expectContract(Number.isInteger(product.id) && product.id > 0, `${path}.id`, "positive integer", product.id);
        expectContract(!seenIds.has(product.id), `${path}.id`, "unique product ID", product.id);
        seenIds.add(product.id);
        requiredStrings.forEach((key) => {
            expectContract(typeof product[key] === "string" && product[key].length > 0, `${path}.${key}`, "non-empty string", product[key]);
        });
        expectContract(Number.isInteger(product.seriesId) && product.seriesId > 0, `${path}.seriesId`, "positive integer", product.seriesId);
        expectContract(Number.isInteger(product.categoryId) && product.categoryId > 0, `${path}.categoryId`, "positive integer", product.categoryId);
        if (selectedCategoryIds.size > 0) {
            expectContract(selectedCategoryIds.has(product.categoryId), `${path}.categoryId`, "selected category ID", product.categoryId);
        }
        optionalUrlStrings.forEach((key) => {
            expectContract(typeof product[key] === "string", `${path}.${key}`, "string", product[key]);
        });
        Object.keys(product).filter((key) => key.startsWith("acf.")).forEach((key) => {
            expectContract(typeof product[key] === "string", `${path}.${key}`, "string", product[key]);
        });
        Object.entries(input.filters).forEach(([key, values]) => {
            const productValue = key === "series" ? product.series : product[key];
            expectContract(values.includes(productValue), `${path}.${key}`, `one of ${values.join(", ")}`, productValue);
        });
    });
    return valid;
}
