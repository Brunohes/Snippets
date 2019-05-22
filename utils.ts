// import * as util from 'util'

export const validadeParams: (params: { [x: string]: string }) => Promise<void> = params => {
	return new Promise((resolve, reject) => {
		// if (typeof params !== 'object') reject({ code: 420, message: 'params is not a object...' })

		const erros = []
		for (const key in params) {
			if (params[key] === undefined || params[key].length === 0) erros.push(key)
		}

		if (erros.length !== 0) reject({ code: 420, message: `dados faltando no corpo da requisição... [ ${erros} ]` })

		resolve()
	})
}

export const validateEnum: (type: string, enumArray: Array<string>) => Promise<void> = (type, enumArray) => {
	return new Promise((resolve, reject) => {
		// if (!util.isArray(enumArray)) reject({ code: 420, message: 'enum is not a array...' })

		if (!type) reject({ code: 420, warning: 'tipo necessário...' })
		if (!enumArray.includes(type)) reject({ code: 420, warning: `tipo ${type} incorreto. [ ${enumArray} ]` })

		resolve()
	})
}
