export const validadeObjParams: (params: {
	[x: string]: string
}) => Promise<void> = (params) => {
	return new Promise((resolve, reject) => {
		if (typeof params !== 'object') reject('Params is not a object...')

		const erros = []
		for (const key in params) {
			if (params[key] === undefined || params[key].length === 0) erros.push(key)
		}

		if (erros.length !== 0)
			reject(`Missing data in request body... [ ${erros} ]`)

		resolve()
	})
}

export const validateEnum: (
	type: string,
	enumArray: Array<string>
) => Promise<void> = (type, enumArray) => {
	return new Promise((resolve, reject) => {
		if (!Array.isArray(enumArray)) reject('Enum is not a array...')

		if (!type) reject('Missing type in request body')
		if (!enumArray.includes(type))
			reject(`Type ${type} is incorrect. Available types: [ ${enumArray} ]`)

		resolve()
	})
}
