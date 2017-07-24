"use strict";

var ko = require("knockout");
var superschema = require("./index.js");
var check = superschema.check;

var defaultName = "configObject";

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
	k: ko.observable(null),
	l: null
};

describe("superschema tests", function() {
	it("has correct interface", function() {
		expect(typeof superschema).toBe("object");
		expect(typeof superschema.check).toBe("function");
		expect(typeof superschema.extend).toBe("function");
	});

	describe("invalid extend usage", function() {
		it("throws error if extend is called without a config object", function() {
			expect(function() {
				superschema.extend();
			}).toThrowError("'config' has to be an object!");

			expect(function() {
				superschema.extend(137);
			}).toThrowError("'config' has to be an object!");
		});

		it("throws error if no ko or knockout params given", function() {
			expect(function() {
				superschema.extend({});
			}).toThrowError("superschema.extend called without any known parameters!");
		});

		it("throws error if extend is called with an invalid knockout object", function() {
			expect(function() {
				superschema.extend({
					ko: 137
				});
			}).toThrowError("Invalid 'knockout' parameter given!");

			expect(function() {
				superschema.extend({
					ko: {}
				});
			}).toThrowError("Invalid 'knockout' parameter given!");

			expect(function() {
				superschema.extend({
					ko: {
						isObservable: "not a function"
					}
				});
			}).toThrowError("Invalid 'knockout' parameter given!");

			expect(function() {
				superschema.extend({
					knockout: "not an object"
				});
			}).toThrowError("Invalid 'knockout' parameter given!");

			expect(function() {
				superschema.extend({
					knockout: {}
				});
			}).toThrowError("Invalid 'knockout' parameter given!");

			expect(function() {
				superschema.extend({
					knockout: {
						isObservable: 42
					}
				});
			}).toThrowError("Invalid 'knockout' parameter given!");

		});
	});

	describe("invalid patterns", function() {
		it ("throws error if the pattern isn't an object or a string", function() {
			var pattern = 137;
			expect(function() {
				check(testObject, pattern);
			}).toThrowError("Invalid pattern: 137");
		});

		it ("invalid pattern prop", function() {
			var pattern = {
				a: 666
			};
			expect(function() {
				check(testObject, pattern);
			}).toThrowError("Invalid pattern: 666");
		});

		it ("invalid type in pattern", function() {
			var pattern = {
				a: {
					__type: true
				}
			};
			expect(function() {
				check(testObject, pattern);
			}).toThrowError("Unknown type: true");
		});

		it ("unknown type in pattern", function() {
			var pattern1 = {
				a: {
					__type: "fuction"
				}
			};
			var pattern2 = {
				a: "booolean"
			};
			expect(function() {
				check(testObject, pattern1);
			}).toThrowError("Unknown type: fuction");
			expect(function() {
				check(testObject, pattern2);
			}).toThrowError("Unknown type: booolean");
		});

		it ("unknown type in pattern - deeper in the string", function() {
			var pattern = {
				j: "array numberd"
			};
			expect(function() {
				check(testObject, pattern);
			}).toThrowError("Unknown type: numberd");
		});

		it ("invalid pattern format", function() {
			var pattern = {
				b: "number number"
			};
			expect(function() {
				check(testObject, pattern);
			}).toThrowError("Invalid pattern: number number");
		});

		it ("throws error when trying observable checking without knockout", function() {
			var pattern = {
				a: {
					__type: "observable"
				}
			};
			expect(function() {
				check(testObject, pattern);
			}).toThrowError("Observable checking is not possible because no knockout instance is given!");
		});
	});

	describe("simple string type definitions - without knockout", function() {
		it("simple type checking - doesn't throw error if correct types are given", function() {
			expect(function() {
				check("beer", "string");
				check(42, "number");
				check(true, "boolean");
				check([], "array");
				check({}, "object");
				check(function() {}, "function");
			}).not.toThrow();
		});

		it("simple type checking - throws error on incorrect types", function() {
			expect(function() {
				check("beer", "array");
			}).toThrowError(defaultName + " has to be an array!");
			expect(function() {
				check(42, "function");
			}).toThrowError(defaultName + " should have function type!");
			expect(function() {
				check(true, "function");
			}).toThrowError(defaultName + " should have function type!");
			expect(function() {
				check([], "function");
			}).toThrowError(defaultName + " should have function type!");
			expect(function() {
				check({}, "function");
			}).toThrowError(defaultName + " should have function type!");
			expect(function() {
				check(function() {}, "number");
			}).toThrowError(defaultName + " should have number type!");
		});

		it ("simple type checking - uses the correct name if given", function() {
			expect(function() {
				check(42, "function", "My little function");
			}).toThrowError("My little function should have function type!");
		});

		it ("doesn't throw error if the test object meets the pattern", function() {
			var pattern = {
				a: "string",
				b: "number",
				c: "object",
				d: "array",
				e: "function",
				f: "function",
				g: "object",
				h: "function",
				i: "boolean",
				j: "array number",
				k: "function"
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
				check(testObject, pattern, "myObject");
			}).toThrowError("myObject.xxx is mandatory!");
		});

		it ("throws error if a property has incorrect type", function() {
			var pattern = {
				a: "number"
			};
			expect(function() {
				check(testObject, pattern, "myObject");
			}).toThrowError("myObject.a should have number type!");
		});

		/*it ("throws error if a property should be an observable", function() {
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
		});*/

		it ("throws error if an element of an array has incorrect type", function() {
			var pattern = {
				d: "array number"
			};
			expect(function() {
				check(testObject, pattern, "myObject");
			}).toThrowError("myObject.d[1] should have number type!");
		});
	});

	describe("object format - without knockout", function() {
		describe("__required and __nullable attributes", function() {
			it("doesn't throw error on missing non-required property", function() {
				var pattern = {
					xxx: {
						__required: false,
						__type: "permutationOrbifold"
					}
				};
				expect(function() {
					check(testObject, pattern);
				}).not.toThrow();
			});

			it("throws error on missing required property", function() {
				var pattern = {
					xxx: {
						__required: true,
						__type: "permutationOrbifold"
					}
				};
				expect(function() {
					check(testObject, pattern, "myObject");
				}).toThrowError("myObject.xxx is mandatory!");
			});

			it("throws error if a non-required property has incorrect type", function() {
				var pattern = {
					a: {
						__required: false,
						__type: "number"
					}
				};
				expect(function() {
					check(testObject, pattern, "myObject");
				}).toThrowError("myObject.a should have number type!");
			});

			it("properties are required by default", function() {
				var pattern = {
					xxx: {
						__type: "object"
					}
				};
				expect(function() {
					check(testObject, pattern, "myObject");
				}).toThrowError("myObject.xxx is mandatory!");
			});

			it("doesn't throw error if a nullable property has 'null' value", function() {
				var pattern = {
					l: {
						__nullable: true,
						__type: "object"
					}
				};
				expect(function() {
					check(testObject, pattern);
				}).not.toThrow();
			});

			it("throws error if a non-nullable property has 'null' value", function() {
				var pattern = {
					l: {
						__nullable: false,
						__type: "object"
					}
				};
				expect(function() {
					check(testObject, pattern, "myObject");
				}).toThrowError("myObject.l shouldn't be null!");
			});

			it("throws error if a nullable property has incorrect type", function() {
				var pattern = {
					a: {
						__nullable: true,
						__type: "object"
					}
				};
				expect(function() {
					check(testObject, pattern, "myObject");
				}).toThrowError("myObject.a should have object type!");
			});

			it("properties are non-nullable by default", function() {
				var pattern = {
					l: {
						__type: "object"
					}
				};
				expect(function() {
					check(testObject, pattern, "myObject");
				}).toThrowError("myObject.l shouldn't be null!");
			});
		});

		it("doesn't throw error if types are correct", function() {
			var pattern = {
				a: {
					__required: true,
					__type: "string"
				},
				b: {
					__required: true,
					__type: "number"
				},
				c: {
					__type: "object"
				},
				d: {
					__type: "array"
				},
				e: {
					__type: "function"
				},
				f: {
					__required: false,
					__type: "function"
				}
			};
			expect(function() {
				check(testObject, pattern);
			}).not.toThrow();
		});

		it("doesn't throw error on correct substructure", function() {
			var pattern = {
				g: {
					g1: "string",
					g2: "function",
					g3: "number"
				}
			};
			expect(function() {
				check(testObject, pattern);
			}).not.toThrow();
		});

		it("throws error if a type is incorrect", function() {
			var pattern = {
				a: {
					__required: true,
					__type: "number"
				}
			};
			expect(function() {
				check(testObject, pattern, "myObject");
			}).toThrowError("myObject.a should have number type!");
		});

		it("checks array element types", function() {
			var pattern = {
				d: {
					__type: "array",
					__elements: "number"
				}
			};
			expect(function() {
				check(testObject, pattern, "myObject");
			}).toThrowError("myObject.d[1] should have number type!");
		});
	});

	describe("with knockout extension", function() {
		beforeAll(function() {
			superschema.extend({
				ko: ko
			});
		});

		it("doesn't throw error on observable check if knockout is given", function() {
			var pattern = {
				f: "observable",
				h: "observable",
				k: "observable"
			};
			expect(function() {
				check(testObject, pattern);
			}).not.toThrow();
		});

		it("checks observables correctly", function() {
			var pattern1 = {
				a: "observable"
			};
			var pattern2 = {
				a: {
					__type: "observable"
				}
			};
			expect(function() {
				check(testObject, pattern1, "myObject");
			}).toThrowError("myObject.a has to be an observable!");
			expect(function() {
				check(testObject, pattern2, "myObject");
			}).toThrowError("myObject.a has to be an observable!");
		});

		it("checks observable content", function() {
			var pattern1 = {
				f: "observable number"
			};
			var pattern2 = {
				f: "observable string"
			};
			expect(function() {
				check(testObject, pattern1);
			}).not.toThrow();
			expect(function() {
				check(testObject, pattern2, "myObject");
			}).toThrowError("myObject.f() should have string type!");
		});

		it("checks observable content - using object syntax", function() {
			var pattern = {
				h: {
					__type: "observable",
					__value: {
						
					}
				}
			};
		});
		
	});

	/*

	describe("long syntax", function() {

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
	});*/
});

/*describe("Valid dependencies - without ko", function() {

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
				f: "function",
				g: "object",
				h: "function",
				i: "boolean",
				j: "array number",
				k: "function"
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

		it ("throws error if we try to check observable type", function() {
			var pattern = {
				b: "observable"
			};
			expect(function() {
				check(testObject, pattern);
			}).toThrowError("ko checking functionality is not enabled!");
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
						g2: "function",
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
					required: true,
					type: "number"
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

		it ("throws error if we try to check observable type", function() {
			var pattern = {
				b: {
					required: false,
					observable: true,
					type: "number"
				}
			};
			expect(function() {
				check(testObject, pattern);
			}).toThrowError("ko checking functionality is not enabled!");
		});

		it ("throws error if we try to check observable type", function() {
			var pattern = {
				f: {
					observable: false,
					type: "number"
				}
			};
			expect(function() {
				check(testObject, pattern);
			}).toThrowError("ko checking functionality is not enabled!");
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
});*/