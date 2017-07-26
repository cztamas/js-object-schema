# Superschema

A simple tool for checking JS types and object formats.

## Types

The currently supported types are *boolean*, *number*, *string*, *array*, *function*, *object*, *date*, and also the knockout *observable*.

## Usage

After requiring the `superschema` module, you can use the `superschema.check(data, pattern, name)` function.
Here `data` is the data you want to typecheck, `pattern` defines the type pattern your data should conform to. The check function will throw an error if the data doesn't correspond to the given type, and will use `name` in the error message to make it more informative (it defaults to '*configObject*' if `name` is not given).

### Pattern syntax

* Simple object structure:
E.g. if your data should be an object with *username*, *id*, *registeredAt* properties, where *username* is a string, *id* is a number and *registeredAt* is a JS *Date* object, you can check that using the following pattern:
```
{
	username: "string",
	id: "number",
	registeredAt: "date"
}
```

* Nested objects:
you can type in deeper object hierarchies as they are, e.g.
```
{
	id: "number",
	userData: {
		username: "string",
		userid: "number",
		purchases: "array"
	},
	productData: {
		productId: "number",
		description: "string"
	}
}
```
means that the *userData* and *productData* properties should be objects with the given substructures.

* Arrays:
if you want to check the type of elements in an array, you can use the
```
{
	purchases: {
		__type: "array",
		__elements: {
			time: "date",
			id: "number"
		}
	}
}
```
syntax - this means that the *purchase* prop has to be an array, and its elements should be objects with *time* and *id* properties.
Or if your array element doesn't have to have some predefined substructure, you can use the `"array number"` and similar type definitions - it means that the array should have number-type elements.

* Non-mandatory and nullable properties:
If a property is allowed to be `null` or `undefined`, you can use a `"nullable number"` or `"optional number"` (or even `"nullable optional number"`) type syntax.
In case of objects and arrays you can use the *__nullable* and *__required* properties, e.g:
```
{
	userdata: {
		__required: false,
		purchases: {
			__type: "array",
			__nullable: true
		}
	}
}
```
means that *userdata*, if not undefined, should be an object with a *purchases* property, which can be `null` or an array.

* Enums:
If a property can only have one of a collection of given values, you give the allowed values in an array in the __allowedValues property:
```
{
	userdata: {
		rank: {
			__allowedValues: ["basic", "vip", "superhero"]
		}
	}
}
```

* KnockoutJS observables:
To check knockout observable types, you should call the `superschema.extend({ knockout: yourKnockoutInstance})` function - here of course `yourKnockoutInstance` should be the knockout instance used in your code. (This is because superschema uses ko's own isObservable function for typechecking). You have to call this only once in your code.
After that, you can use the "observable" type, e.g. the pattern
```
{
	username: "observable",
	id: "observable number",
	lastOrder: {
		__type: "observable",
		__value: {
			id: "number",
			description: "string"
		}
	}
}
```
means *username* should be an observable, *id* should be an observable containing a number, and *lastOrder* should be an observable containing an object with id, description properties.

### Error message format

The error message will indicate the first place where the data doesn't conform to the given pattern (e.g. something like `config.userdata.id should have number type` or `userdata.purchases[1].date has to be a date object!`), or the first place when an unknown type was encountered in the pattern (to protect from misspellings). So e.g. if you type *fuction* as type somewhere, the error message will be `Unknown type: fuction`.