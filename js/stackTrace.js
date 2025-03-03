function getStackTrace() {
  const err = new Error() //  нужен Error для получения стека вызовов
  return err.stack
}

function exampleFunction() {
  const stackTrace = getStackTrace()
  console.log(stackTrace)
}

  exampleFunction()
