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
	l: null,
	m: {},
	n: new Date()
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
				k: "function",
				m: "object",
				n: "date"
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
			var pattern1 = {
				a: "number"
			};
			var pattern2 = {
				b: "date"
			};
			expect(function() {
				check(testObject, pattern1, "myObject");
			}).toThrowError("myObject.a should have number type!");
			expect(function() {
				check(testObject, pattern2, "myObject");
			}).toThrowError("myObject.b has to be a date object!");
		});

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

			it("doesn't throw error on missing non-required property - shorthand case", function() {
				var pattern = {
					xxx: "optional superhero"
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

			it("throws error if a non-required property has incorrect type - shorthand case", function() {
				var pattern = {
					a: "optional number"
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

			it("doesn't throw error if a nullable property has 'null' value - shorthand case", function() {
				var pattern = {
					l: "nullable object"
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

			it("throws error if a nullable property has incorrect type", function() {
				var pattern = {
					a: "nullable object"
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

		it("uses nested object sorthand correctly", function() {
			var pattern1 = {
				"g.g2": "function"
			};
			var pattern2 = {
				"g.g1": "number"
			};
			var pattern3 = {
				"m.m2.xxx": "function"
			};
			expect(function() {
				check(testObject, pattern1, "myObject");
			}).not.toThrow();
			expect(function() {
				check(testObject, pattern2, "myObject");
			}).toThrowError("myObject.g.g1 should have number type!");
			expect(function() {
				check(testObject, pattern3, "myObject");
			}).toThrowError("myObject.m.m2 should have object type!");
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
				k: {
					__type: "observable"
				}
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
			var pattern1 = {
				h: {
					__type: "observable",
					__value: {
						h1: "observable number",
						h2: "string"
					}
				}
			};
			var pattern2 = {
				h: {
					__type: "observable",
					__value: {
						h1: "observable string",
						h2: "string"
					}
				}
			};
			expect(function() {
				check(testObject, pattern1);
			}).not.toThrow();
			expect(function() {
				check(testObject, pattern2, "myObject");
			}).toThrowError("myObject.h().h1() should have string type!");
		});
		
	});
});