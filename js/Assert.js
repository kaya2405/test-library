// как chai простой фрэймворк для тестов
// функции-тесты не должны иметь доступ к служебным функциям таким как run, print, а

export default class Assert {
     constructor(runner) {
         this.runner = runner
     }

     equal(a, b) {// либо сделать стрелочную функцию из этой чтобы сохранить правильный контекст this
         const error = a === b ? undefined : new Error(`Ожидаются равные параметры: ${a} == ${b} (актуальное == ожидаемое)`)
         this.runner.report('equal', error)

         // return this, позволяет реализовать шаблон последовательность (pattern chain),
         // assert.exists(actual).equal(actual, expected)
         // чтобы не писать многострочно и избыточно, вроде следующего:
         // assert.exists(actual)
         // assert.equal(actual, expected)
         return this
     }
}
