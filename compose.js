// Реализуйте функцию compose, которая в качестве аргументов принимает несколько функций
// одного аргумента и возвращает их композицию. Это тоже будет функция одного аргумента.
// compose(f, g, ...)(x) == f(g(...(x)))
function compose(...funs) {
    return function(params) {
        let result = params
        for (let f = funs.length - 1; f >= 0; --f) {
            result = funs[f](result)
        }
        return result
    }
}

// можно улучшить и вытащить сами функции ассертов в отдельный класс, чтобы
// функции-тесты не имели доступ к служебным функциям таким как run, print, а
// то все посыплется будут вызовы рекурсивные функций
// заодно отработать паттерн Dependency Injection в функции run
function Assert() {
    this.reset()
}

Assert.prototype.reset = function() {
    // сюда будем класть отчет вида { test: [name, error] }
    this.tests = {}
    this.runned = 0 // счетчик для количества запущенных функций тестов
    this.reported = 0 // отчетов
}

// полагаем соглашение для фунций проверки, что в случае успешного отчета
// помещаем error как undefined, или в случае ошибки строка с ошибкой
// notEqual, exists - проверка на то чтобы не было равно null или undefined,
// notExists,isNumber, isEmpty - для проверки на пустой массив по length, isNonEmpty
Assert.prototype.equal = function(a, b) {
    const error = a === b ? undefined : `Ожидаются равные параметры: ${a} == ${b} (актуальное == ожидаемое)`
    this.report(arguments.callee.caller.name, arguments.callee.name, error)

    // возвращая this, позволяет реализовать шаблон последовательность (pattern chain),
    // т.е. цепочку вызовов, например:
    // assert.exists(actual).equal(actual, expected)
    return this
}

Assert.prototype.report = function(test, name, error) { // test - имя теста, name имя функции проверки (assert)
    ++this.reported
    // если отчетов для данного теста с именем теста нет, то добавляем
    const reports = this.tests[test] || []
    if (!reports.length) this.tests[test] = reports
    reports.push([name, error])
    // reports никуда не возвращает т к он ранее был добавлен
    // в tests (который в конструкторе Assert this.tests)
}

Assert.prototype.run = function(...funs) {
    // сбрасываем отчеты по тестам
    this.reset()

    let tmp
    funs.forEach(fun => {
        tmp = this.reported
        try {
            // вот тут делается интъекция нужного объекта, чтобы функциям было проще
            // и чтобы они не заботились о создании объекта и времени его жизни
            fun(this)
        } catch (error) {
            this.report(fun.name, '', error.toString())
        } finally {
            ++this.runned
            if (tmp === this.reported)
                this.report(fun.name, '', 'Для функции не добавлено никаких проверок')
        }
    })
}

Assert.prototype.print = function() {
    // берем отчеты из tests сортируем тесты которые прошли-passed и которые с ошибками-failed
    const passed = []
    const failed = []

    let reports
    let ok
    for (const test in this.tests) {
        reports = this.tests[test]
        // будем считать тест успешным для всех отчетов для данного теста (например
        // функция с именем testCompose) пустое сообщение об ошибке
        // [name, error] - name это имя функции проверки (например equal)
        ok = reports.length > 0 && reports.every(([name, error]) => error === undefined)
        if (ok) passed.push(test)
        else failed.push([test, reports])
    }

    passed.forEach(test => console.log(`OK: [${test}]`))

    failed.forEach(([test, reports]) => {
        // для функции test выводим какие проверки (equal, и т.д.) выполнялись
        // и с какими ошибками, т.е.
        // проверка: ошибка
        console.error(`FAIL: [${test}]`)
        reports.forEach(([name, error]) => {
            console.error(`${name || 'ERROR'}: ${error}`)
        })
    })

    const summary = `ОК = ${passed.length}, FAIL = ${failed.length}`
    console.log(summary)
}

// параметр assert это пример паттерна Dependency Injection
function testCompose(assert) {
    // f(g(h(1)))
    {
        // = 1 + (2 * (1 * 1)) = 3
        const f = p => p + 1
        const g = p => p * 2
        const h = p => p * p
        const result = compose(f, g, h)(1)
        assert.equal(result, 3)
    }

    {
        // = (2 * (1 + 1)) * (2 * (1 + 1)) = 16
        const f = p => p * p
        const g = p => p * 2
        const h = p => p + 1
        const result = compose(f, g, h)(1)
        assert.equal(result, 16)
    }
}

function main() {
    const assert = new Assert()
    assert.run(testCompose)
    assert.print()
}
main()
