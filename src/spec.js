"use strict";

var ko = require("knockout");
var check = require("./index.js");

var testObject = {
	a: "some string",
	b: 42,
	c: {},
	d: [42, "cute little string"],
	e: function() {},
	f: ko.observable(3),
	g: {
		g1: "another string",
		g2: ko.observable(12),
		g3: 4
	},
	h: ko.observable({
		h1: ko.observable(99),
		h2: "even more strings are coming!"
	}),
	i: true,
	j: [1, 2, 3],
	k: ko.observable(null)
};

describe("test the parameters given", function() {
	it ("throws error if the pattern isn't an object", function() {
		var pattern = "not remotely an object";
		expect(function() {
			check(testObject, pattern);
		}).toThrowError("The pattern to check has to be given as an object!");
	});

	it ("invalid pattern prop", function() {
		var pattern = {
			a: 666
		};
		expect(function() {
			check(testObject, pattern);
		}).toThrowError("The props of the pattern to check must be strings or objects!");
	});

	it ("invalid type in pattern", function() {
		var pattern = {
			a: {
				type: true
			}
		};
		expect(function() {
			check(testObject, pattern);
		}).toThrowError("Invalid pattern: 'true' was given as type!");
	});

	it ("throws error if the item to check is not an object", function() {
		expect(function() {
			check("ugly, evil string", {});
		}).toThrowError("The item to be checked has to be an object!");
	});
});

describe("simple required case", function() {
	it ("doesn't throw error if the test object meets the pattern", function() {
		var pattern = {
			a: "string",
			b: "number",
			c: "object",
			d: "array",
			e: "function",
			f: "observable number",
			g: "object",
			h: "observable object",
			i: "boolean",
			j: "array number",
			k: "observable"
		};
		expect(function() {
			check(testObject, pattern);
		}).not.toThrow();
	});

	it ("throws error on missing required property", function() {
		var pattern = {
			xxx: "boolean"
		};
		expect(function() {
			check(testObject, pattern);
		}).toThrowError("The 'xxx' property is mandatory!");
	});

	it ("throws error if a property has incorrect type", function() {
		var pattern = {
			a: "number"
		};
		expect(function() {
			check(testObject, pattern);
		}).toThrowError("The 'a' property should have number type!");
	});

	it ("throws error if a property should be an observable", function() {
		var pattern = {
			b: "observable"
		};
		expect(function() {
			check(testObject, pattern);
		}).toThrowError("The 'b' property has to be an observable!");
	});

	it ("throws error if an observable property's value has incorrect type", function() {
		var pattern = {
			f: "observable string"
		};
		expect(function() {
			check(testObject, pattern);
		}).toThrowError("The 'f()' property should have string type!");
	});

	it ("throws error if an element should be an array", function() {
		var pattern = {
			a: "array"
		};
		expect(function() {
			check(testObject, pattern);
		}).toThrowError("The 'a' property has to be an array!");
	});

	it ("throws error if an element of an array has incorrect type", function() {
		var pattern = {
			d: "array number"
		};
		expect(function() {
			check(testObject, pattern);
		}).toThrowError("The 'd[1]' property should have number type!");
	});
});

describe("non-required properties", function() {
	it ("doesn't throw error on missing non-required property", function() {
		var pattern = {
			xxx: {
				required: false,
				type: "Sith Lord"
			}
		};
		expect(function() {
			check(testObject, pattern);
		}).not.toThrow();
	});

	it ("throws error if a non-required property has incorrect type", function() {
		var pattern = {
			a: {
				required: false,
				type: "number"
			}
		};
		expect(function() {
			check(testObject, pattern);
		}).toThrowError("The 'a' property should have number type!");
	});
});

describe("testing object types", function() {
	it ("doesn't throw error on correct substructure", function() {
		var pattern = {
			g: {
				type: {
					g1: "string",
					g2: "observable number",
					g3: "number"
				}
			}
		};
		expect(function() {
			check(testObject, pattern);
		}).not.toThrow();
	});

	it ("throws error if the property to check is not an object", function() {
		var pattern = {
			a: {
				type: {
					xxx: "Sith Lord",
				}
			}
		};
		expect(function() {
			check(testObject, pattern);
		}).toThrowError("The 'a' property has to be an object!");
	});

	it ("throws error on missing required inner property", function() {
		var pattern = {
			g: {
				type: {
					xxx: "Sith Lord",
				}
			}
		};
		expect(function() {
			check(testObject, pattern);
		}).toThrowError("The 'g.xxx' property is mandatory!");
	});
});

describe("long syntax", function() {
	it ("doesn't throw error if types are correct", function() {
		var pattern = {
			a: {
				required: true,
				type: "string"
			},
			b: {
				observable: false,
				required: true,
				type: "number"
			},
			f: {
				required: false,
				observable: true,
				type: "number"
			},
			h: {
				observable: true,
				type: {
					h1: {
						observable: true,
						type: "number"
					},
					h2: "string"
				}
			}
		};
		expect(function() {
			check(testObject, pattern);
		}).not.toThrow();
	});

	it ("throws error if a type is incorrect", function() {
		var pattern = {
			a: {
				required: true,
				type: "number"
			}
		};
		expect(function() {
			check(testObject, pattern);
		}).toThrowError("The 'a' property should have number type!");
	});

	it ("throws error if a property should be an observable", function() {
		var pattern = {
			b: {
				required: true,
				observable: true,
				type: "number"
			}
		};
		expect(function() {
			check(testObject, pattern);
		}).toThrowError("The 'b' property has to be an observable!");
	});

	it ("throws error if a property shouldn't be an observable", function() {
		var pattern = {
			f: {
				observable: false,
				type: "number"
			}
		};
		expect(function() {
			check(testObject, pattern);
		}).toThrowError("The 'f' property shouldn't be an observable!");
	});

	it ("throws error on a missing required property", function() {
		var pattern = {
			xxx: {
				observable: false,
				type: "Sith Lord"
			}
		};
		expect(function() {
			check(testObject, pattern);
		}).toThrowError("The 'xxx' property is mandatory!");
	});

	it ("checks existence of property even if no type requirement given", function() {
		var pattern = {
			xxx: {
				required: true
			}
		};
		expect(function() {
			check(testObject, pattern);
		}).toThrowError("The 'xxx' property is mandatory!");

		var pattern2 = {
			xxx: {}
		};
		expect(function() {
			check(testObject, pattern2);
		}).toThrowError("The 'xxx' property is mandatory!");

		var pattern3 = {
			a: {}
		};
		expect(function() {
			check(testObject, pattern3);
		}).not.toThrow();
	});
});