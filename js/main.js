import runner, { assert, test } from "./Runner"

// Реализуйте функцию compose, которая в качестве аргументов принимает несколько функций
// одного аргумента и возвращает их композицию. Это тоже будет функция одного аргумента.
// compose(f, g, ...)(x) == f(g(...(x)))
function compose(...funs) {
    return function(params) {
        let result = params
        for (let f = funs.length - 1; f >= 0; --f) {
            // result = Function.apply.apply(funs[f], result)
            result = funs[f](result)
        }
        return result
    }
}

// параметр assert это пример паттерна Dependency Injection
test('1 + (2 * (1 * 1)) = 3', () => {
    const f = p => p + 1
    const g = p => p * 2
    const h = p => p * p
    const result = compose(f, g, h)(1)
    assert.equal(result, 3)
})

// поменяла из первого примера выше первую и последнюю функции местами
test('(2 * (1 + 1)) * (2 * (1 + 1)) = 16', () => {
    const f = p => p * p
    const g = p => p * 2
    const h = p => p + 1
    const result = compose(f, g, h)(1)
    assert.equal(result, 16)
})

test('Тестируем тест с ошибкой Error - exception', () => {
    throw new Error('Эта ошибка сделана намерена для теста')
})

function main() {
    // так запускаем один тест, например тот который текущий разрабатываем и тестируем проверяем
    // runner.run('(2 * (1 + 1)) * (2 * (1 + 1)) = 16')

    // запуск теста с ошибкой
    runner.run('Тестируем тест с ошибкой Error - exception')

    // так запускаем все тесты
    // runner.run()

    runner.print()
}
main()
