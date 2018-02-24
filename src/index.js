"use strict";

var koInstance;
var defaultName = "configObject";
var nonRequiredName = "optional";
var nullableName = "nullable";

function extendSuperSchema(config) {
	if (typeof config !== "object") {
		throw new Error("'config' has to be an object!");
	}
	var ko = config.knockout || config.ko;
	if (!ko) {
		throw new Error("superschema.extend called without any known parameters!");
	}
	if (typeof ko !== "object" || typeof ko.isObservable !== "function") {
		throw new Error("Invalid 'knockout' parameter given!");
	}
	koInstance = ko;
}

function checkPattern(item, pattern, name) {
	name = name || defaultName;
	if (typeof pattern === "object") {
		return checkObjectPattern(item, pattern, name);
	}
	if (typeof pattern === "string") {
		return checkStringPattern(item, pattern, name);
	}
	throw new Error("Invalid pattern: " + pattern);
}

function checkStringPattern(item, pattern, name) {
	var currentType = pattern.split(" ")[0];
	var remainingPattern = pattern.split(" ").slice(1).join(" ");
	if (currentType === nonRequiredName) {
		if (item === undefined) {
			return;
		}
		return checkStringPattern(item, remainingPattern, name);
	}
	if (currentType === nullableName) {
		if (item === null) {
			return;
		}
		return checkStringPattern(item, remainingPattern, name);
	}
	if (item === undefined) {
		throw new Error(name + " is mandatory!");
	}
	if (item === null) {
		throw new Error(name + " shouldn't be null!");
	}
	checkType(item, currentType, name);
	if (remainingPattern) {
		if (currentType === "array") {
			item.forEach(function(element, index) {
				checkStringPattern(element, remainingPattern, name + "[" + index + "]");
			});
			return;
		}

		if (currentType === "observable") {
			checkStringPattern(item(), remainingPattern, name + "()");
			return;
		}

		throw new Error("Invalid pattern: " + pattern);
	}
}

function checkObjectPattern(item, pattern, name) {
	if (item === undefined) {
		if (pattern.__required !== false) {
			throw new Error(name + " is mandatory!");
		}
		return;
	}
	if (item === null) {
		if (pattern.__nullable !== true) {
			throw new Error(name + " shouldn't be null!");
		}
		return;
	}
	var allowedValues = pattern.__allowedValues;
	if (allowedValues) {
		if (!Array.isArray(allowedValues)) {
			throw new Error("Invalid pattern: the __allowedValues property always has to be an array!");
		}
		return checkAllowedValues(item, allowedValues, name);
	}
	var type = pattern.__type;
	type = type || "object"; // Object is the default type when using an object pattern format.
	checkType(item, type, name);
	switch (type) {
		case "array": {
			if (pattern.__elements !== undefined) {
				item.forEach(function(element, index) {
					checkPattern(element, pattern.__elements, name + "[" + index + "]");
				});
			}
			return;
		}
		case "observable":
		case "function":
		case "object": {
			for (var prop in pattern) {
				if (prop === "__type" || prop === "__required" || prop === "__nullable" || prop === "__value") {
					continue;
				}
				checkShorthandPattern(item, prop, pattern[prop], name);
			}
			if (type === "observable" && pattern.__value) {
				checkPattern(item(), pattern.__value, name + "()");
			}
			return;
		}
	}
}

function checkAllowedValues(item, values, name) {
	for (var i = 0; i < values.length; i += 1) {
		if (item === values[i]) {
			return;
		}
	}
	throw new Error("The value of " + name + " is not among the allowed ones!");
}

function checkShorthandPattern(item, prop, pattern, name) {
	var keys = prop.split(".");
	var current = item;
	keys.forEach(function(key) {
		if (typeof current !== "object") {
			throw new Error(name + " should have object type!");
		}
		current = current[key];
		name += "." + key;
	});
	checkPattern(current, pattern, name);
}

function createSimpleTypeChecker(type) {
	return function(value, name) {
		if (typeof value !== type) {
			throw new Error(name + " should have " + type + " type!");
		}
	};
}

function checkArray(value, name) {
	if (!Array.isArray(value)) {
		throw new Error(name + " has to be an array!");
	}
}

function checkObservable(value, name) {
	if (!koInstance) {
		throw new Error("Observable checking is not possible because no knockout instance is given!");
	}
	if (!koInstance.isObservable(value)) {
		throw new Error(name + " has to be an observable!");
	}
}

function checkDate(value, name) {
	if (!(value instanceof Date)) {
		throw new Error(name + " has to be a date object!");
	}
}

var typeCheckers = {
	array: checkArray,
	boolean: createSimpleTypeChecker("boolean"),
	date: checkDate,
	function: createSimpleTypeChecker("function"),
	number: createSimpleTypeChecker("number"),
	object: createSimpleTypeChecker("object"),
	observable: checkObservable,
	string: createSimpleTypeChecker("string")
};

function checkType(value, type, name) {
	if (!typeCheckers[type]) {
		throw new Error("Unknown type: " + type);
	}
	typeCheckers[type](value, name);
}

module.exports = {
	check: checkPattern,
	extend: extendSuperSchema
};