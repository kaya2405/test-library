import Assert from "./Assert"

export class Runner {
    constructor() {
        this.assert = new Assert(this)
        this.reset()
    }

    reset() {
        this.queue = [] // очередь тестов на запуск вида [[name, fn], ...]
        this.testName = '' // текущее имя теста (см выше name)

        this.tests = {} // отчет вида { test: [name, error] }
        this.runned = 0 // счетчик для количества запущенных функций тестов
        this.reported = 0 //отчетов
    }

    // @name - это имя функции проверки (например assert.equal)
    // @error - сообщение об ошибке
    report(name, error) {
        ++this.reported // если отчетов для данного теста с именем теста нет, то добавляем

        const reports = this.tests[this.testName] || []
        if (!reports.length) this.tests[this.testName] = reports
        // тут одиночный отчет добавляем
        reports.push([name, error])
        // почему reports ничего не возвращает, то он ранее был добавлен
        // в tests (который в конструкторе Assert this.tests)
    }

    test(name, fn) {
        this.queue.push([name, fn])
    }

    // Запускает все тесты, если без параметров, или конкретный тест, если задано имя (info) теста
    // @name - имя теста
    run(testName) {
        let tmp
        this.queue.forEach(([name, fn]) => {
            // ищем нужный тест и запускаем
            // если задано имя одного теста для запуска, то пропускаем все остальные
            if (testName && testName != name) return

            tmp = this.reported
            this.testName = name
            try {
                // вот тут делается инъекция нужного объекта, чтобы функциям было проще
                // и чтобы они не заботились о создании объекта и времени его жизни

                fn()
            } catch (error) {
                // debugger
                // console.log('typeof error:', typeof(error))
                // console.log(error.stack)
                this.report(name, '', error) // @name - это имя функции проверки (assert)
            } finally {
                ++this.runned
                // случай когда в функции не вставлено никаких проверок, добавляем ее в отчеткак ошибочную
                if (tmp === this.reported) {
                    this.report(name, '', 'Для функции не добавлено никаких проверок')
                }
            }
        })
    }

    print() {
        // берем отчеты из tests сортируем тесты на passed и failed
        const passed = []
        const failed = []
        let reports
        let ok
        for (const test in this.tests) {
            reports = this.tests[test]

            console.log('reports: ', reports)

            // будем считать тест успешным для всех отчетов для данного теста (например
            // функция с именем testCompose) пустое сообщение об ошибке
            // @report: [name, error] - name это имя функции проверки (например equal)

            ok = reports.length > 0 && reports.every(([_/*name*/, error]) => error === undefined)

            if (ok) passed.push(test)
            else failed.push([test, reports]) // может здесь написать failed.push(...reports)
            // else failed.push(...reports)
        }

        console.table('failed: ', failed)

        debugger

        // печатаем отчет
        passed.forEach(test => console.log(`печатаем отчет OK: [${test}]`))

        failed.forEach(([test, reports]) => {
            // debugger
            // для функции test выводим какие проверки (equal, и т.д.) выполнялись
            // и с какими ошибками, т.е. проверка: ошибка
            console.error(`FAIL: [${test}]`)
            reports.forEach(([name, error]) => {
                if (name) {
                    console.error(`${name}: ${error}`)
                } else {
                    console.log('typeof error:', typeof(error))
                    console.error(`ERROR: ${error}`)
                    console.error(error.stack)
                }
                // console.error(`${name || 'ERROR'}: ${error}`)

                // console.log(`${name || 'печатаем отчет ERROR'}: ${error}`)
            })
        })

        const summary = `ОК = ${passed.length}, FAIL = ${failed.length}`
        console.log(summary)
    }
}

const runner = new Runner()
export default runner
// делаем экспорт assert чтобы был импортирован один раз
// пример:
// import { assert } from './Assert'
// и чтобы в функциях тестовых использовать
// до этого было что в каждой функции делали injection assert, чтобы не писать у каждой
// тестовой функции параметр assert (несколько раз), сделано чтобы использовали через import assert
export const assert = runner.assert

// функция обертка (helpers/помощники)
// @name - текстовое описание теста, например "Тест формулы такой-то"
// параметр assert это пример паттерна Dependency Injection
// @fn - функция теста, например assert => {
//     // тело теста
// }
export function test(name, fn) {
    // debugger
    runner.test(name, fn)
}
