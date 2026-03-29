const ClassManager = function () {
  let id = 0 | (Math.random() * 998)
  let instanceId = 0 | (Math.random() * 998)

  this.getNewID = function () {
    return id++
  }

  this.getNewInstanceId = function () {
    return instanceId++
  }
}

export const classManager = new ClassManager()
