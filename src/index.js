"use strict";

module.exports = function(dependencies) {

	var ko;
	var koEnabled = false;
	dependencies = dependencies || {};

	if (dependencies.ko) {
		if (typeof dependencies.ko !== "object" || typeof dependencies.ko.isObservable !== "function") {
			throw new Error("Invalid 'ko' parameter given!");
		}
		ko = dependencies.ko;
		koEnabled = true;
	}

	function checkDependencies(item, pattern, namePrefix) {
		if (typeof pattern !== "object") {
			throw new Error("The pattern to check has to be given as an object!");
		}
		if (typeof item !== "object") {
			throw new Error((namePrefix ? namePrefix : "The item to be checked") + " has to be an object!");
		}
		namePrefix = namePrefix || "";
		for (var prop in pattern) {
			// A simple string as pattern means a required property.
			if (typeof pattern[prop] === "string") {
				if (!item.hasOwnProperty(prop)) {
					throw new Error("The '" + namePrefix + prop + "' property is mandatory!");
				}
				checkProp(item[prop], pattern[prop], prop);
				continue;
			}
			if (typeof pattern[prop] !== "object") {
				throw new Error("The props of the pattern to check must be strings or objects!");
			}
			// If the item has the current property, we check its type.
			if (item.hasOwnProperty(prop)) {
				var currentItem = item[prop];
				var currentPattern = pattern[prop];
				// If the "observable" property is given in the pattern, we check whether out prop is an observable.
				if (currentPattern.hasOwnProperty("observable")) {
					if (!koEnabled) {
						throw new Error("ko checking functionality is not enabled!");
					}
					if (currentPattern.observable === true) {
						if (!ko.isObservable(currentItem)) {
							throw new Error("The '" + namePrefix + prop + "' property has to be an observable!");
						}
						currentItem = currentItem();
					}
					// Here false means it shouldn't be an observable.
					if (currentPattern.observable === false) {
						if (ko.isObservable(currentItem)) {
							throw new Error("The '" + namePrefix + prop + "' property shouldn't be an observable!");
						}
					}
				}
				// If no type requirement is given, we are done with this property.
				if (!currentPattern.type) {
					continue;
				} 
				// Otherwise we check the type of the property.
				else {
					checkProp(currentItem, currentPattern.type, prop);
				}
			// When missing a required property...
			} else if (pattern[prop].required !== false) {
				throw new Error("The '" + namePrefix + prop + "' property is mandatory!");
			}
		}
	}

	// Here we check one given property.
	function checkProp(prop, typeData, name) {
		if (typeof typeData === "object") {
			if (typeof prop !== "object") {
				throw new Error("The '" + name + "' property has to be an object!");
			}
			// We can require a nontrivial object structure from any prop - we check these recursively.
			checkDependencies(prop, typeData, name + ".");
			return;
		}
		if (typeof typeData === "string") {
			// We allow observable checking with the "observable" or "observable number", etc. types, too...
			if (typeData.split(" ")[0] === "observable") {
				if (!koEnabled) {
					throw new Error("ko checking functionality is not enabled!");
				}
				if (!ko.isObservable(prop)) {
					throw new Error("The '" + name + "' property has to be an observable!");
				}
				if (typeData.split(" ").length > 1) {
					var newProp = prop();
					var newTypeData = typeData.split(" ").slice(1).join("");
					checkProp(newProp, newTypeData, name + "()");
				}
				return;
			}
			// We allow array checking with the "array" or "array number", etc. types, too...
			if (typeData.split(" ")[0] === "array") {
				if (!Array.isArray(prop)) {
					throw new Error("The '" + name + "' property has to be an array!");
				}
				if (typeData.split(" ").length > 1) {
					var newTypeData = typeData.split(" ").slice(1).join("");
					prop.forEach(function(element, index) {
						checkProp(element, newTypeData, name + "[" + index + "]");					
					});
				}
				return;
			}
			// Otherwise we just check the type.
			if (typeof prop !== typeData) {
				throw new Error("The '" + name + "' property should have " + typeData + " type!");
			}
			return;
		}
		throw new Error("Invalid pattern: '" + typeData + "' was given as type!");
	}

	return checkDependencies;
};