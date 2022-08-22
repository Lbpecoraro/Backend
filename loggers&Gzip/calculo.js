const calculoPesado = (cantidad) => {

    let numbers = {}

    for (let i = 0; i < cantidad; i++) {
        let random = Math.floor(Math.random() * 1000 + 1);
        let key = random.toString()

        if (numbers[key]) {
            numbers[key]++
        } else {
            numbers[key] = 1
        }
    }
    return numbers
}

module.exports = calculoPesado;