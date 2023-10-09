const math = require('../src/math')
require('dotenv').config({ path: './config/test.env'})

test('Calculates the correct tip', () => {
    const total = math.Tip(100, 30)
    expect(total).toBe(130)
})

test('Calculates the correct default tip', () => {
    const total = math.Tip(100)
    expect(total).toBe(110)
})

test("Should convert 32 F to 0 C", () => {
    const temp = math.fahrenheitToCelsius(32)
    expect(temp).toBe(0)
})

test("Should convert 0 C to 32 F", () => {
    const temp = math.celsiusToFahrenheit(0)
    expect(temp).toBe(32)
})

// test('Testing async', (done) => {
//     setTimeout(() => {
//         expect(1).toBe(2)
//         done()
//     }, 2000)
// })

test('Testing async add', (done) => {
    math.add(1, 2).then((sum) => {
        expect(sum).toBe(3)
        done()
    })
})

test('Testing async/await add', async () => {
    const result = await math.add(1,2)
    expect(result).toBe(3)
})